import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Blueprint, EmotionProfile, EngineBlueprint, ScoreReport } from '../types';

const DIMENSION_LABELS: Record<keyof ScoreReport['dimensions'], string> = {
  emotionalAlignment: 'Emotional Alignment',
  visualBalance: 'Visual Balance',
  stemDensity: 'Stem Density',
  colorHarmony: 'Color Harmony',
};

interface QualityGateProps {
  blueprint: (EngineBlueprint | Blueprint) & { report?: ScoreReport };
  emotionProfile: EmotionProfile;
  onRepair: (updatedBlueprint: Partial<EngineBlueprint | Blueprint>) => void;
}

/**
 * Displays the ScoreReport produced by BlueprintOrchestrator.runOrchestrator
 * and, when the report status is 'REPAIR NEEDED', offers a one-click repair
 * that nudges the blueprint's density toward the emotion profile's target
 * before re-scoring is expected to happen upstream.
 */
export function QualityGate({ blueprint, emotionProfile, onRepair }: QualityGateProps) {
  const report = blueprint.report;
  if (!report) return null;

  const passed = report.status === 'PASS';

  const applyRepair = () => {
    const dna = 'dna' in blueprint ? blueprint.dna : undefined;
    if (!dna) return;
    const densityMatch: Record<string, number> = { airy: 0.3, balanced: 0.55, full: 0.85 };
    const targetDensity = densityMatch[emotionProfile.density] ?? 0.55;
    onRepair({
      dna: { ...dna, density_profile: targetDensity },
    } as Partial<Blueprint>);
  };

  return (
    <Card className="border-none shadow-none bg-primary/[0.03]">
      <CardHeader className="px-8 py-6 border-b border-primary/5 flex-row items-center justify-between space-y-0">
        <CardTitle className="display-text text-sm text-primary/60 flex items-center gap-2">
          {passed ? (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
          Quality Gate — {report.status} ({Math.round(report.total * 100)}%)
        </CardTitle>
        {!passed && (
          <Button size="sm" variant="outline" onClick={applyRepair}>
            Apply Repair
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(report.dimensions) as Array<keyof ScoreReport['dimensions']>).map((key) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs uppercase tracking-wide text-primary/50">
                <span>{DIMENSION_LABELS[key]}</span>
                <span>{Math.round(report.dimensions[key] * 100)}%</span>
              </div>
              <div className="h-1 bg-primary/10">
                <div
                  className="h-1 bg-primary/60"
                  style={{ width: `${Math.round(report.dimensions[key] * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {report.warnings.length > 0 && (
          <ul className="text-xs text-amber-700 space-y-1 pt-2">
            {report.warnings.map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
