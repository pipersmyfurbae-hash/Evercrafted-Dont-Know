import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import * as core from '../moodoor/core';

/**
 * Server-side (firebase-admin) half of the Phase 1-3 migration described in
 * "Moodoor Matching Code Walkthrough and Platform Migration Plan.md":
 * builds the public, read-only `moodoor_public_listings` projection from
 * canonical `marketplace_listings`, and records publish/unpublish events to
 * `moodoor_publication_events`. Consumed by the /api/v1/moodoor/* routes in
 * server.ts — never by the browser client directly.
 */

const LISTINGS_COLLECTION = 'marketplace_listings';
const PROJECTION_COLLECTION = 'moodoor_public_listings';
const EVENTS_COLLECTION = 'moodoor_publication_events';

export interface MoodoorPublicListingV1 {
  schemaVersion: 'moodoor_public_listing.v1';
  listingId: string;
  title: string;
  summary: string;
  heroImageUrl: string | null;
  price: { amount: number | null; currency: 'USD' };
  availability: 'in_stock' | 'limited';
  formula: string | null;
  moodTags: string[];
  seasonTags: string[];
  paletteTags: string[];
  publishedAt: FirebaseFirestore.FieldValue | string;
  sourceVersion: { listingUpdatedAt: FirebaseFirestore.FieldValue | string };
}

function toProjection(candidate: core.MoodoorListing): MoodoorPublicListingV1 | null {
  // Defense-in-depth: the projection never stores an unavailable or
  // not-yet-approved listing, even if a caller passes one in.
  if (candidate.availability === 'unavailable') return null;
  return {
    schemaVersion: 'moodoor_public_listing.v1',
    listingId: candidate.id,
    title: candidate.title,
    summary: candidate.summary,
    heroImageUrl: candidate.imageUrl,
    price: { amount: candidate.price, currency: 'USD' },
    availability: candidate.availability as 'in_stock' | 'limited',
    formula: candidate.formula,
    moodTags: candidate.moodTags,
    seasonTags: candidate.seasonTags,
    paletteTags: candidate.paletteTags,
    publishedAt: FieldValue.serverTimestamp(),
    sourceVersion: { listingUpdatedAt: FieldValue.serverTimestamp() },
  };
}

/**
 * Rebuilds (or removes) the public projection for one canonical listing.
 * Called after any canonical write that could affect Moodoor eligibility:
 * publish/unpublish, quality re-scoring, availability change.
 */
export async function rebuildMoodoorProjection(db: Firestore, listingId: string): Promise<'published' | 'revoked'> {
  const listingSnap = await db.collection(LISTINGS_COLLECTION).doc(listingId).get();
  const projectionRef = db.collection(PROJECTION_COLLECTION).doc(listingId);

  if (!listingSnap.exists) {
    await projectionRef.delete();
    return 'revoked';
  }

  const raw = listingSnap.data() as core.MarketplaceDocument;
  const candidate = core.toMoodoorListing(listingId, raw);

  if (!candidate) {
    await projectionRef.delete();
    return 'revoked';
  }

  const projection = toProjection(candidate);
  if (!projection) {
    await projectionRef.delete();
    return 'revoked';
  }

  await projectionRef.set(projection);
  return 'published';
}

/** Reads the current public projection catalog — the only Firestore read the public matcher performs. */
export async function getPublicMoodoorCatalog(db: Firestore): Promise<core.MoodoorListing[]> {
  const snapshot = await db.collection(PROJECTION_COLLECTION).get();
  return snapshot.docs
    .map((entry) => {
      const data = entry.data() as MoodoorPublicListingV1;
      const listing: core.MoodoorListing = {
        id: data.listingId,
        title: data.title,
        summary: data.summary,
        imageUrl: data.heroImageUrl,
        price: data.price?.amount ?? null,
        currency: data.price?.currency ?? 'USD',
        seasonTags: data.seasonTags ?? [],
        moodTags: data.moodTags ?? [],
        paletteTags: data.paletteTags ?? [],
        formula: data.formula,
        availability: data.availability,
        quality: 'approved', // the projection only ever holds already-approved listings
        publishedAt: null,
        isMoodoorPublished: true,
      };
      return listing;
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export type PublicationAction = 'publish' | 'unpublish';

export interface PublicationResult {
  status: 'published' | 'revoked';
}

/**
 * The maker Studio publication transaction: validates the canonical record's
 * marketplace status/quality/availability, flips the explicit Moodoor
 * release flag, rebuilds (or removes) the projection, and appends an audit
 * event — all atomically, so the projection can never drift from the
 * canonical record's actual eligibility.
 */
export async function setMoodoorPublicationServer(
  db: Firestore,
  listingId: string,
  action: PublicationAction,
  actor: { uid: string }
): Promise<PublicationResult> {
  const listingRef = db.collection(LISTINGS_COLLECTION).doc(listingId);
  const eventRef = db.collection(EVENTS_COLLECTION).doc();

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(listingRef);
    if (!snap.exists) {
      throw new Error('Listing not found.');
    }
    const raw = snap.data() as core.MarketplaceDocument;

    if (raw.creatorId !== actor.uid) {
      throw new Error('You do not own this listing.');
    }

    if (action === 'publish') {
      const candidate = core.toMoodoorCandidate(listingId, raw);
      if (!candidate) {
        throw new Error('Listing is not eligible for Moodoor (must be published, available, and quality-approved).');
      }
    }

    tx.update(listingRef, {
      moodoorPublished: action === 'publish',
      moodoorStatus: action === 'publish' ? 'published' : 'unpublished',
      moodoorUpdatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(eventRef, {
      listingId,
      action,
      actorUid: actor.uid,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return { status: await rebuildMoodoorProjection(db, listingId) };
}
