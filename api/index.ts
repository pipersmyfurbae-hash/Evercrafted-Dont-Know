// api/index.ts — the Express app as a Vercel serverless function.
//
// Every request that doesn't match a static asset in dist/ is rewritten to
// this function (see vercel.json's catch-all rewrite), so the app's
// original relative routes (/blueprint/*, /vision/*, /motion/*, /project/*,
// /api/v1/moodoor/*) keep working unchanged. Local development
// (`npm run dev`) uses server.ts instead, which wraps this same app with
// Vite's dev middleware.
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { analyzeWreathImage } from '../src/services/vision-flower-engine.ts';
import { generateMotion } from '../src/services/motionEngine.ts';
import { isDoorId, isMoodId, isSeasonId, rankMoodoorMatches, toPublicMatch } from '../services/moodoor/core.ts';
import { getPublicMoodoorCatalog, setMoodoorPublicationServer } from '../services/supabaseMoodoorProjection.ts';
import { createSupabaseAdminClient } from '../services/supabaseAdmin.ts';
import { createRateLimiter } from '../services/rateLimiter.ts';

// Not secret — see lib/supabase.ts for why these have the same fallback.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kxkvsrwpezusqvriftqv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jT7UCGSoRXIAkAh73DZoSg_vjbVbc_5';
const db = createSupabaseAdminClient();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

export const app = express();
app.use(express.json());

// Blueprint Routes
app.post('/blueprint/create', async (req, res) => {
  try {
    const { prompt, formula, inventory, diameter } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate a wreath design blueprint based on: "${prompt}". Formula: ${formula}. Inventory: ${JSON.stringify(inventory)}. Diameter: ${diameter}. Output valid JSON blueprint.`,
      config: {
        systemInstruction: `You are Evercrafted, a deterministic floral design engine. Convert prompt into structured, buildable wreath designs.`,
        responseMimeType: 'application/json',
      }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Blueprint creation error:', error);
    res.status(500).json({ error: 'Failed to create blueprint' });
  }
});

app.post('/blueprint/from-emotion', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate a complete Evercrafted wreath design package based on this memory/emotion: "${prompt}". Output valid JSON blueprint.`,
      config: {
        systemInstruction: `You are Evercrafted, a deterministic floral design engine. Convert emotion into structured, buildable wreath designs.`,
        responseMimeType: 'application/json',
      }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Emotion blueprint error:', error);
    res.status(500).json({ error: 'Failed to generate blueprint from emotion' });
  }
});

app.post('/blueprint/from-inventory', async (req, res) => {
  try {
    const { blueprint, inventory } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate a wreath design blueprint using ONLY these inventory items: ${JSON.stringify(inventory)}. Current blueprint context: ${JSON.stringify(blueprint)}. Output valid JSON blueprint.`,
      config: {
        systemInstruction: `You are Evercrafted, a deterministic floral design engine. Match inventory to blueprint requirements.`,
        responseMimeType: 'application/json',
      }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Inventory blueprint error:', error);
    res.status(500).json({ error: 'Failed to generate blueprint from inventory' });
  }
});

// Vision Routes
app.post('/vision/analyze', upload.single('image'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    const result = await analyzeWreathImage(imageUrl);
    res.json(result.blueprint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Placement Routes (QACS AI)
app.post('/ai/placement', async (req, res) => {
  try {
    const { prompt, wreathSize } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate a QACS blueprint for a ${wreathSize} inch wreath based on: "${prompt}". Output ONLY raw JSON array.`,
      config: { responseMimeType: 'application/json' }
    });
    res.json(JSON.parse(response.text || '[]'));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate AI placement' });
  }
});

// Motion Routes
app.post('/motion/emotion-detect', async (req, res) => {
  try {
    const { description } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Analyze emotional intent: "${description}". Output JSON: {"emotion": string, "motionProfile": "whisper"|"breeze"|"statement", "motionType": "sway"|"rotation"|"pulse", "intensity": number, "rationale": string}`,
      config: { responseMimeType: 'application/json' }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    res.status(500).json({ error: 'Motion detection failed' });
  }
});

app.post('/motion/brief', async (req, res) => {
  try {
    const { description } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate a motion brief for: "${description}". Output JSON: {"emotionMapping": string, "recommendedProfile": "whisper"|"breeze"|"statement", "recommendedType": "sway"|"rotation"|"pulse", "intensity": number, "socialUse": string, "etsyUse": string, "shotList": string[]}`,
      config: { responseMimeType: 'application/json' }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    res.status(500).json({ error: 'Brief generation failed' });
  }
});

app.post('/motion/generate', async (req, res) => {
  try {
    const { projectId, motion_type, motion_intensity } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    // Return immediately
    res.json({ status: 'processing', message: 'Motion generation pipeline initiated' });

    // Non-blocking process
    (async () => {
      try {
        const { data: project, error: projectError } = await db
          .from('projects')
          .select('render')
          .eq('id', projectId)
          .single();
        if (projectError || !project) throw new Error('Project not found');

        const renderUrl = project.render;
        if (!renderUrl) throw new Error('No render image found in project');

        const videoPath = await generateMotion(renderUrl, motion_type, motion_intensity, 10, 30);

        const fileName = `motions/${projectId}-${Date.now()}.mp4`;
        const videoBuffer = await fs.promises.readFile(videoPath);
        const { error: uploadError } = await db.storage
          .from('generated-media')
          .upload(fileName, videoBuffer, { contentType: 'video/mp4' });
        if (uploadError) throw uploadError;
        const { data: publicUrl } = db.storage.from('generated-media').getPublicUrl(fileName);

        await db
          .from('projects')
          .update({
            motion: {
              type: motion_type,
              intensity: motion_intensity,
              duration: 10,
              fps: 30,
              videoUrl: publicUrl.publicUrl,
            },
          })
          .eq('id', projectId);
      } catch (error) {
        console.error('Motion generation pipeline error:', error);
      }
    })();
  } catch (error) {
    console.error('Motion generation error:', error);
    res.status(500).json({ error: 'Failed to initiate motion generation' });
  }
});

// Moodoor Routes (Part III of the migration plan in
// "Moodoor Matching Code Walkthrough and Platform Migration Plan.md")
const moodoorMatchesRateLimit = createRateLimiter({ windowMs: 60_000, max: 30 });
app.post('/api/v1/moodoor/matches', moodoorMatchesRateLimit, async (req, res) => {
  try {
    const { mood, season, door } = req.body ?? {};
    if (!isMoodId(mood) || !isSeasonId(season) || !isDoorId(door)) {
      return res.status(400).json({ error: 'mood, season, and door must each be a valid Moodoor enum value.' });
    }

    const catalog = await getPublicMoodoorCatalog(db);
    const matches = rankMoodoorMatches({ mood, season, door }, catalog).map(toPublicMatch);

    res.json({ matches, catalogSize: catalog.length, noMatch: matches.length === 0 });
  } catch (error) {
    console.error('Moodoor match error:', error);
    res.status(500).json({ error: 'Failed to compute Moodoor matches' });
  }
});

app.patch('/api/v1/moodoor/studio/listings/:id/publication', async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    if (!accessToken) return res.status(401).json({ error: 'Missing bearer token.' });

    const { data: userResult, error: userError } = await db.auth.getUser(accessToken);
    if (userError || !userResult.user) return res.status(401).json({ error: 'Invalid or expired session.' });

    const { action } = req.body ?? {};
    if (action !== 'publish' && action !== 'unpublish') {
      return res.status(400).json({ error: "action must be 'publish' or 'unpublish'." });
    }

    const supabaseAsCaller = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const result = await setMoodoorPublicationServer(supabaseAsCaller, req.params.id, action);
    res.json(result);
  } catch (error) {
    console.error('Moodoor publication error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update Moodoor publication.';
    const status = message.includes('do not own') || message.includes('does not include')
      ? 403
      : message.includes('not found') || message.includes('not eligible')
        ? 400
        : 500;
    res.status(status).json({ error: message });
  }
});

// Project Routes
app.post('/project/save', async (_req, res) => {
  res.json({ status: 'success', message: 'Project saved' });
});

app.get('/project/list', async (_req, res) => {
  res.json({ projects: [] });
});

app.get('/project/:id', async (req, res) => {
  res.json({ project: { id: req.params.id } });
});

export default app;
