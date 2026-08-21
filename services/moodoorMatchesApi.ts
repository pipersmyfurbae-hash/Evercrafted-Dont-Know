import type { MoodProfile, PublicMoodoorMatch } from './moodoor/core';

export type { PublicMoodoorMatch };

export interface MoodoorMatchesResponse {
  matches: PublicMoodoorMatch[];
  catalogSize: number;
  noMatch: boolean;
}

/**
 * Public consumer finder client — calls the server-side matcher instead of
 * reading marketplace_listings from the browser. This is the Phase 5
 * "cutover" step of the migration plan: the public projection and ranking
 * now live entirely behind POST /api/v1/moodoor/matches.
 */
export async function fetchMoodoorMatches(profile: MoodProfile): Promise<MoodoorMatchesResponse> {
  const response = await fetch('/api/v1/moodoor/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Moodoor could not read the current wreath edit.');
  }

  return response.json();
}
