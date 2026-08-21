import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import * as core from './moodoor/core';

/**
 * Legacy client-side adapter: reads `marketplace_listings` directly from the
 * browser and ranks in-memory. Kept in place (and still exercised by
 * scripts/test-moodoor-matching.integration.ts) for the maker Studio view and
 * as a fallback during the Phase 4 "shadow matching" rollout described in
 * "Moodoor Matching Code Walkthrough and Platform Migration Plan.md". The
 * public consumer finder (pages/Moodoor.tsx MoodoorFinder) now calls the
 * server-side POST /api/v1/moodoor/matches route instead of this module —
 * see services/firebase/moodoorProjection.ts for the server-side counterpart,
 * which shares this exact eligibility/scoring logic via ./moodoor/core.
 */

export type MoodId = core.MoodId;
export type SeasonId = core.SeasonId;
export type DoorId = core.DoorId;
export type MoodProfile = core.MoodProfile;
export type MoodoorListing = core.MoodoorListing;
export type MoodoorMatch = core.MoodoorMatch;
type MarketplaceDocument = core.MarketplaceDocument;

export const toMoodoorCandidate = core.toMoodoorCandidate;
export const toMoodoorListing = core.toMoodoorListing;
export const rankMoodoorMatches = core.rankMoodoorMatches;
export const moodChoices = core.moodChoices;
export const seasonChoices = core.seasonChoices;
export const doorChoices = core.doorChoices;
export const moodoorQualityThreshold = core.MINIMUM_QUALITY_SCORE;

export async function getMoodoorCatalog(): Promise<MoodoorListing[]> {
  const snapshot = await getDocs(query(collection(db, 'marketplace_listings'), where('status', '==', 'published')));
  return snapshot.docs
    .map((entry) => core.toMoodoorListing(entry.id, entry.data() as MarketplaceDocument))
    .filter((entry): entry is MoodoorListing => entry !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getCreatorMoodoorListings(creatorId: string): Promise<MoodoorListing[]> {
  const snapshot = await getDocs(query(collection(db, 'marketplace_listings'), where('creatorId', '==', creatorId)));
  return snapshot.docs
    .map((entry) => core.toMoodoorCandidate(entry.id, entry.data() as MarketplaceDocument))
    .filter((entry): entry is MoodoorListing => entry !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Publish/unpublish now goes through the server transaction in
 * services/firebase/moodoorProjection.ts (via PATCH
 * /api/v1/moodoor/studio/listings/:id/publication) instead of a direct
 * client Firestore write, so the public projection is rebuilt atomically
 * with the canonical release flag — see Part IV, Phase 3 of the migration
 * plan. Requires a signed-in Studio maker.
 */
export async function setMoodoorPublication(listingId: string, publish: boolean): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in to publish to Moodoor.');
  }
  const idToken = await currentUser.getIdToken();

  const response = await fetch(`/api/v1/moodoor/studio/listings/${listingId}/publication`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ action: publish ? 'publish' : 'unpublish' }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'The publication state could not be updated.');
  }
}
