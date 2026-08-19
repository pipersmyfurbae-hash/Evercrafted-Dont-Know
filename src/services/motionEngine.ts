import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';

export type MotionType = 'sway' | 'rotation' | 'pulse';

const ZOOMPAN_BY_TYPE: Record<MotionType, (intensity: number) => string> = {
  // Gentle side-to-side pan, reading as a breeze moving the wreath.
  sway: (intensity) => `zoompan=z='1.05':x='iw/2-(iw/zoom/2)+sin(on/30)*${Math.round(10 * intensity)}':y='ih/2-(ih/zoom/2)':d=1:s=1080x1080`,
  // Slow rotation is approximated with a diagonal pan sweep (ffmpeg's zoompan has no native rotate).
  rotation: (intensity) => `zoompan=z='1.08':x='iw/2-(iw/zoom/2)+cos(on/40)*${Math.round(14 * intensity)}':y='ih/2-(ih/zoom/2)+sin(on/40)*${Math.round(14 * intensity)}':d=1:s=1080x1080`,
  // Rhythmic zoom in/out, reading as a heartbeat/pulse.
  pulse: (intensity) => `zoompan=z='1+0.05*${intensity}*abs(sin(on/20))':d=1:s=1080x1080`,
};

async function downloadToTemp(sourceUrl: string, destPath: string): Promise<void> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch render image: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(destPath, buffer);
}

/**
 * Turns a single static wreath render into a short looping motion clip via
 * ffmpeg's zoompan filter. Returns a local file path; the caller (server.ts's
 * /motion/generate route) uploads that file to Cloud Storage.
 */
export async function generateMotion(
  renderUrl: string,
  motionType: MotionType,
  intensity: number,
  durationSeconds: number,
  fps: number
): Promise<string> {
  const workDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'evercrafted-motion-'));
  const inputPath = path.join(workDir, 'source.png');
  const outputPath = path.join(workDir, `${randomUUID()}.mp4`);

  await downloadToTemp(renderUrl, inputPath);

  const clampedIntensity = Math.max(0, Math.min(1, intensity));
  const filter = ZOOMPAN_BY_TYPE[motionType]?.(clampedIntensity) ?? ZOOMPAN_BY_TYPE.sway(clampedIntensity);
  const totalFrames = Math.max(1, Math.round(durationSeconds * fps));

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .loop(durationSeconds)
      .videoFilters(`${filter}:fps=${fps}:frames=${totalFrames}`)
      .outputOptions(['-pix_fmt yuv420p', `-t ${durationSeconds}`])
      .on('error', reject)
      .on('end', () => resolve())
      .save(outputPath);
  });

  return outputPath;
}
