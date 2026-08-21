import { supabase } from '../lib/supabase';
import * as core from './moodoor/core';

/**
 * Legacy client-side adapter: reads `moodoor_listings` directly from the
 * browser (RLS-scoped to the caller's own rows, or admin) and ranks
 * in-memory via ./moodoor/core — the exact same eligibility/scoring logic
 * the server uses. Kept for the maker Studio view; the public consumer
 * finder (pages/Moodoor.tsx MoodoorFinder) calls the server-side
 * POST /api/v1/moodoor/matches route instead — see
 * services/supabaseMoodoorProjection.ts for the server-side counterpart.
 *
 * This was originally built against Firestore's `marketplace_listings`,
 * which had many legacy field-name aliases (title/name, imageUrl/image_url,
 * etc.) — see ./moodoor/core's MarketplaceDocument type and its tolerant
 * adapter functions. The Postgres `moodoor_listings` table (see
 * supabase/migrations/0001_moodoor_and_app_tables.sql) is a single fresh
 * shape with no aliases, so `rowToMarketplaceDocument` below just maps it
 * onto that same MarketplaceDocument shape rather than rewriting the
 * (already tested) core adapter logic.
 */

export type MoodId = core.MoodId;
export type SeasonId = core.SeasonId;
export type DoorId = core.DoorId;
export type MoodProfile = core.MoodProfile;
export type MoodoorListing = core.MoodoorListing;
export type MoodoorMatch = core.MoodoorMatch;

export const toMoodoorCandidate = core.toMoodoorCandidate;
export const toMoodoorListing = core.toMoodoorListing;
export const rankMoodoorMatches = core.rankMoodoorMatches;
export const moodChoices = core.moodChoices;
export const seasonChoices = core.seasonChoices;
export const doorChoices = core.doorChoices;
export const moodoorQualityThreshold = core.MINIMUM_QUALITY_SCORE;

interface MoodoorListingRow {
  id: string;
  creator_id: string | null;
  title: string;
  summary: string;
  image_url: string | null;
  price: number | null;
  season_tags: string[];
  mood_tags: string[];
  palette_tags: string[];
  formula: string | null;
  marketplace_status: string;
  availability: string;
  quality_score: number | null;
  quality_approved: boolean;
  moodoor_published: boolean;
  moodoor_status: string;
}

function rowToMarketplaceDocument(row: MoodoorListingRow): core.MarketplaceDocument {
  return {
    title: row.title,
    summary: row.summary,
    price: row.price ?? undefined,
    status: row.marketplace_status,
    creatorId: row.creator_id ?? undefined,
    imageUrl: row.image_url ?? undefined,
    formula: row.formula ?? undefined,
    moodTags: row.mood_tags,
    seasons: row.season_tags,
    palette: row.palette_tags,
    availability: row.availability,
    qualityApproved: row.quality_approved,
    qualityScore: row.quality_score ?? undefined,
    moodoorPublished: row.moodoor_published,
    moodoorStatus: row.moodoor_status,
  };
}

export async function getMoodoorCatalog(): Promise<MoodoorListing[]> {
  const { data, error } = await supabase
    .from('moodoor_listings')
    .select('*')
    .eq('marketplace_status', 'published');
  if (error) throw error;

  return (data as MoodoorListingRow[])
    .map((row) => core.toMoodoorListing(row.id, rowToMarketplaceDocument(row)))
    .filter((entry): entry is MoodoorListing => entry !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getCreatorMoodoorListings(creatorId: string): Promise<MoodoorListing[]> {
  const { data, error } = await supabase
    .from('moodoor_listings')
    .select('*')
    .eq('creator_id', creatorId);
  if (error) throw error;

  return (data as MoodoorListingRow[])
    .map((row) => core.toMoodoorCandidate(row.id, rowToMarketplaceDocument(row)))
    .filter((entry): entry is MoodoorListing => entry !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Publish/unpublish goes through the server's PATCH
 * /api/v1/moodoor/studio/listings/:id/publication route, which in turn
 * calls the set_moodoor_publication() Postgres function — an atomic
 * ownership + eligibility check, projection rebuild, and audit event, all
 * in one transaction. Requires a signed-in Studio maker.
 */
export async function setMoodoorPublication(listingId: string, publish: boolean): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be signed in to publish to Moodoor.');
  }

  const response = await fetch(`/api/v1/moodoor/studio/listings/${listingId}/publication`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action: publish ? 'publish' : 'unpublish' }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'The publication state could not be updated.');
  }
}
