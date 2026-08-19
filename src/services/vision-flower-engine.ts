import { GoogleGenAI, Type } from '@google/genai';
import type { EngineBlueprint } from '../../types';

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Image analysis is not configured for this environment.');
  }
  return new GoogleGenAI({ apiKey });
}

export interface WreathImageAnalysis {
  blueprint: EngineBlueprint;
}

/**
 * Reverse-engineers a photographed wreath into an EngineBlueprint by asking
 * Gemini's vision model to infer formula, element placement, and density
 * from the image. Consumed by the /vision/analyze route in server.ts.
 */
export async function analyzeWreathImage(imageDataUrl: string): Promise<WreathImageAnalysis> {
  const ai = getAI();
  const match = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('Expected a base64 data URL image.');
  }
  const [, mimeType, data] = match;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data } },
          {
            text: `Analyze this photo of a completed wreath and reconstruct it as a structured
EngineBlueprint: formula name, diameter, open_arc, clusters (center/spread/density), and
elements (role, theta 0-360, radius 0-1, layer, scale). Infer values from what is visible;
do not invent SKUs. Return JSON: { "blueprint": EngineBlueprint }.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          blueprint: { type: Type.OBJECT },
        },
        required: ['blueprint'],
      },
    },
  });

  if (!response.text) {
    throw new Error('Failed to analyze wreath image.');
  }

  return JSON.parse(response.text) as WreathImageAnalysis;
}
