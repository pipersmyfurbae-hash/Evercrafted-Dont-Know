import type { Blueprint, EmotionProfile, EngineBlueprint, ScoreReport } from '../types';

const PASS_THRESHOLD = 0.78; // matches the quality bar used elsewhere in this app (see moodoorMatching.ts)
const WARNING_THRESHOLD = 0.7;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Deterministic, explainable scoring — same design philosophy as the Moodoor
 * matcher: no model call, four bounded dimensions, an explicit pass threshold.
 * Scores fall back to a neutral midpoint (with a warning) when the blueprint
 * doesn't carry WreathDNA, since several dimensions depend on it.
 */
function scoreBlueprint(blueprint: EngineBlueprint | Blueprint, emotionProfile: EmotionProfile): ScoreReport {
  const warnings: string[] = [];
  const dna = 'dna' in blueprint ? blueprint.dna : undefined;

  let emotionalAlignment: number;
  if (dna) {
    const densityMatch: Record<string, number> = { airy: 0.3, balanced: 0.55, full: 0.85 };
    const targetDensity = densityMatch[emotionProfile.density] ?? 0.55;
    emotionalAlignment = clamp01(1 - Math.abs(dna.density_profile - targetDensity));
  } else {
    emotionalAlignment = 0.7;
    warnings.push('No WreathDNA present — emotional alignment estimated from defaults.');
  }

  let visualBalance: number;
  if (dna) {
    visualBalance = clamp01(1 - Math.abs(dna.focal_ratio + dna.greenery_ratio - 1));
  } else {
    const elementCount = blueprint.elements?.length ?? 0;
    visualBalance = elementCount > 0 ? 0.75 : 0.5;
    if (elementCount === 0) warnings.push('Blueprint has no placed elements to evaluate balance from.');
  }

  const maxElements = blueprint.constraints?.max_elements ?? 0;
  const stemDensity = maxElements > 0
    ? clamp01((blueprint.elements?.length ?? 0) / maxElements)
    : 0.6;
  if (maxElements === 0) warnings.push('Blueprint constraints missing max_elements — stem density is a default estimate.');

  const colorHarmony = emotionProfile.colors && emotionProfile.colors.length > 0
    ? clamp01(0.6 + Math.min(emotionProfile.colors.length, 4) * 0.1)
    : 0.6;
  if (!emotionProfile.colors?.length) warnings.push('Emotion profile has no color palette — color harmony is a default estimate.');

  const total = clamp01(
    emotionalAlignment * 0.3 + visualBalance * 0.3 + stemDensity * 0.2 + colorHarmony * 0.2
  );

  const dimensions = { emotionalAlignment, visualBalance, stemDensity, colorHarmony };
  for (const [name, value] of Object.entries(dimensions)) {
    if (value < WARNING_THRESHOLD) warnings.push(`${name} scored below ${WARNING_THRESHOLD.toFixed(2)}.`);
  }

  return {
    dimensions,
    total,
    status: total >= PASS_THRESHOLD ? 'PASS' : 'REPAIR NEEDED',
    warnings,
  };
}

export interface OrchestratorResult {
  report: ScoreReport;
  blueprint: EngineBlueprint | Blueprint;
}

/**
 * Scores a freshly generated blueprint against its emotion profile. Callers
 * (Memory Weaver, Inventory Weaver, Image Analyzer) surface the report via
 * <QualityGate>, which offers a repair action when status is 'REPAIR NEEDED'.
 */
export async function runOrchestrator(
  blueprint: EngineBlueprint | Blueprint,
  emotionProfile: EmotionProfile
): Promise<OrchestratorResult> {
  const report = scoreBlueprint(blueprint, emotionProfile);
  return { report, blueprint };
}
