import type { SupabaseClient } from '@supabase/supabase-js';
import * as core from './moodoor/core';

/**
 * Server-side (service-role client) half of the Moodoor matching setup —
 * the Supabase equivalent of the earlier Firestore-based
 * services/moodoorProjection.ts (removed in this migration). Reads the public
 * `moodoor_public_listings` projection for the matcher, and delegates
 * publish/unpublish to the `set_moodoor_publication()` Postgres function
 * (supabase/migrations/0001_moodoor_and_app_tables.sql), which performs the
 * ownership + eligibility checks, projection rebuild, and audit event all
 * in one transaction. Consumed by the /api/v1/moodoor/* routes in
 * server.ts — never by the browser client directly.
 */

interface PublicListingRow {
  listing_id: string;
  title: string;
  summary: string;
  hero_image_url: string | null;
  price_amount: number | null;
  price_currency: string;
  availability: 'in_stock' | 'limited';
  formula: string | null;
  mood_tags: string[];
  season_tags: string[];
  palette_tags: string[];
}

/** Reads the current public projection catalog — the only table the public matcher queries. */
export async function getPublicMoodoorCatalog(supabaseAdmin: SupabaseClient): Promise<core.MoodoorListing[]> {
  const { data, error } = await supabaseAdmin.from('moodoor_public_listings').select('*');
  if (error) throw error;

  return (data as PublicListingRow[])
    .map((row): core.MoodoorListing => ({
      id: row.listing_id,
      title: row.title,
      summary: row.summary,
      imageUrl: row.hero_image_url,
      price: row.price_amount,
      currency: row.price_currency,
      seasonTags: row.season_tags ?? [],
      moodTags: row.mood_tags ?? [],
      paletteTags: row.palette_tags ?? [],
      formula: row.formula,
      availability: row.availability,
      quality: 'approved', // the projection only ever holds already-approved listings
      publishedAt: null,
      isMoodoorPublished: true,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export type PublicationAction = 'publish' | 'unpublish';
export interface PublicationResult {
  status: 'published' | 'revoked';
}

/**
 * Calls set_moodoor_publication() as the caller (not the service role), so
 * `auth.uid()` inside that SECURITY DEFINER function resolves to the actual
 * signed-in maker and its ownership/role checks apply to them — not to an
 * all-powerful service-role identity. See server.ts: the route builds a
 * per-request client authenticated as the caller via their bearer token.
 */
export async function setMoodoorPublicationServer(
  supabaseAsCaller: SupabaseClient,
  listingId: string,
  action: PublicationAction
): Promise<PublicationResult> {
  const { data, error } = await supabaseAsCaller.rpc('set_moodoor_publication', {
    p_listing_id: listingId,
    p_action: action,
  });

  if (error) throw new Error(error.message);
  return { status: data as 'published' | 'revoked' };
}
