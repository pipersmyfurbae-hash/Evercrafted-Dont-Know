# Extraction Status — Phase 0 & Phase 1

Source of this work: `Review HTML and Run Evercrafted Web Builder.zip`, unpacked and sorted
into the layout `package.json` and the Moodoor integration docs already assumed.

## Placed into the app source tree

| File | Destination |
|---|---|
| `firebase.ts` | `lib/firebase.ts` |
| `AuthContext.tsx` | `contexts/AuthContext.tsx` |
| `moodoorMatching.ts` | `services/moodoorMatching.ts` |
| `geminiClient.ts` | `services/geminiClient.ts` |
| `emotionTranslator.ts` | `services/emotionTranslator.ts` |
| `tierService.ts` | `services/tierService.ts` |
| `inventory-matching.ts` | `services/inventory-matching.ts` |
| `marketplaceService.ts` | `services/firebase/marketplaceService.ts` |
| `Moodoor.tsx`, `MoodoorLanding.tsx`, `Sourcing.tsx`, `MemoryWeaver.tsx`, `InventoryWeaver.tsx`, `ImageAnalyzer.tsx`, `Assistant.tsx` | `pages/` |
| `Layout.tsx`, `TierGuard.tsx` | `components/` |
| `types.ts`, `server.ts`, `vite.config.ts`, `tsconfig.json`, `index.html` | repo root |
| `test-moodoor-matching.integration.ts` | `scripts/` |
| `audit-moodoor.sh` | `scripts/` |

Destinations were derived from each file's own relative imports (e.g. `marketplaceService.ts`
imports `../../lib/firebase` and `../../types`, which only resolves at `services/firebase/`).

## Moved to `docs/archive/` (reference only, per the integration doc's own dispositions)

- `docs/archive/moodoor-studio-prototype/` — the standalone Wouter/Vite archive shell
  (`App.tsx`, `PublicPages.tsx`, `memoryMatching.ts`, `publishing.ts`, `vnext.ts`, the archive's
  own `test-moodoor-matching.ts`, and the original nested `moodoor-studio.zip`). The integration
  doc explicitly marks this as **"Not copied wholesale"** / **"Excluded from production data"** —
  it depends on files never included in this bundle either (`./campaign`, `./collection`,
  `./lookbook`, `./models`, `wouter`), so it was never buildable as-is.
- `docs/archive/planning/` — process docs (`plan.md`, `app-catalogue.md`, `tier-system.md`,
  `SKILL.md`, `brand-tokens.md`, `react-patterns.md`, verification notes, presenter script).
- `docs/archive/marketing/` — HTML/pptx marketing and pipeline decks.
- Three `.md` files in the zip duplicated docs already tracked at repo root byte-for-byte
  (`Moodoor Matching Algorithm and Scoring Formula.md`, the code-walkthrough doc, and the
  integration doc) — confirmed via `diff` and not re-copied.

`tsconfig.json` now excludes `docs/archive` so the archived prototype doesn't fail the app's
typecheck.

## Known gaps — blocking a full `tsc`/build/test pass

These are real dependencies of the delivered files that were **never included** in the zip —
they belong to the pre-existing base Evercrafted app this bundle was meant to be dropped into.
Nothing was stubbed or fabricated to paper over them:

1. **shadcn `components/ui/*` kit** — `button`, `input`, `card`, `textarea`, `select`, `label`
   are imported by `pages/Assistant.tsx`, `ImageAnalyzer.tsx`, `InventoryWeaver.tsx`,
   `MemoryWeaver.tsx`, `Sourcing.tsx`, and `components/Layout.tsx`, but no `components/ui/`
   directory shipped in the bundle (`package.json` lists `shadcn` as a dependency, so these are
   presumably meant to be generated via the shadcn CLI against the project's own design tokens).
2. **`services/projectService.ts`**, **`services/BlueprintOrchestrator.ts`**,
   **`components/QualityGate.tsx`** — referenced by `ImageAnalyzer.tsx`, `InventoryWeaver.tsx`,
   `MemoryWeaver.tsx`; not present anywhere in the archive.
3. **`firebase-applet-config.json`** — real Firebase project credentials required by
   `lib/firebase.ts`. Must be supplied by the project owner, not fabricated. Once available,
   `npm run test:moodoor-matching` should run cleanly (the matching logic itself has no other
   unresolved dependency).
4. **`src/services/vision-flower-engine.ts`**, **`src/services/motionEngine.ts`** — referenced
   by `server.ts`; not present in the archive.

## Verified

- `npm install` succeeds.
- `npx tsc --noEmit` now only reports the gaps listed above (previously it also flaged the
  archived prototype's own missing modules — resolved by excluding `docs/archive`).
- `services/moodoorMatching.ts` itself has exactly one unresolved dependency: the Firebase
  config in gap #3. Its scoring logic matches the spec in
  `Moodoor Matching Algorithm and Scoring Formula.md` verbatim (verified by inspection).

## Suggested next step

Get gap #3 (`firebase-applet-config.json`, or an env-var-driven equivalent — `dotenv` is already
a dependency) supplied, which unblocks running the existing matching test suite end-to-end.
Gaps #1 and #2 block a full `tsc --noEmit` / production build and require either sourcing the
missing base-app files or generating the shadcn components fresh.

---

## Phase 1 — Gaps closed

All four gaps above are now resolved with first-pass, working implementations (not fabricated
business logic dressed up as complete — each is documented below with what it actually does):

1. **`components/ui/*`** — `button.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `card.tsx`,
   `select.tsx` added as plain Tailwind-styled primitives (no Radix/Base UI wiring), matching
   the exact export names each page imports. `lib/utils.ts` adds the standard shadcn `cn()`
   helper. These are a minimal functional stand-in — swap for real shadcn-generated components
   (`npx shadcn add ...`) once the project's design tokens are finalized.
2. **`services/projectService.ts`** — `createProject()` writes to a Firestore `projects`
   collection with the exact fields each caller (`ImageAnalyzer`, `InventoryWeaver`,
   `MemoryWeaver`) already passes.
   **`services/BlueprintOrchestrator.ts`** — `runOrchestrator()` implements a deterministic,
   explainable 4-dimension scorer (emotionalAlignment, visualBalance, stemDensity, colorHarmony)
   against the `ScoreReport` contract already defined in `types.ts`, using the same `0.78` pass
   threshold the Moodoor matcher uses elsewhere in this codebase. Falls back to documented
   neutral estimates (with a warning) when a blueprint lacks `WreathDNA`.
   **`components/QualityGate.tsx`** — renders that `ScoreReport` and offers a repair action that
   nudges `dna.density_profile` toward the emotion profile's target density.
3. **Firebase config** — `lib/firebase.ts` now reads `VITE_FIREBASE_*` env vars (falling back to
   `process.env` so the same module works under both the Vite build and the plain-Node test
   runner) instead of importing a committed `firebase-applet-config.json`. See `.env.example`.
   No credentials were fabricated — you still need to supply real ones to run against a live
   Firebase project.
4. **`src/services/vision-flower-engine.ts`** — `analyzeWreathImage()` sends the uploaded image to
   Gemini's vision model (same `GoogleGenAI` pattern as `services/emotionTranslator.ts`) asking it
   to reconstruct an `EngineBlueprint` from what's visible.
   **`src/services/motionEngine.ts`** — `generateMotion()` downloads the render, then uses
   `fluent-ffmpeg`'s `zoompan` filter to produce a short pan/zoom clip per `motion_type`
   (`sway`/`rotation`/`pulse`). This is a first working version, not the polished production
   motion pipeline the naming implies — worth revisiting once there's a real spec for what
   "Motion Engine" output should look like.

`App.tsx` / `main.tsx` / `index.css` were also added — the zip never contained an entry point for
this app (the `App.tsx` it did contain belonged to the archived Wouter prototype, see Phase 0).
The new `App.tsx` wires `react-router-dom` routes for every page that was extracted:
`/moodoor`, `/moodoor/find` (public, per the integration doc), and `/app/apps/*` +
`/app/moodoor-studio` behind `TierGuard`, matching the feature-tier gates already defined in
`services/tierService.ts`.

## Verified (Phase 1)

- `npx tsc --noEmit` — clean, zero errors.
- `npm run test:moodoor-matching` (with dummy `VITE_FIREBASE_*` env vars set) — all 34 tests pass.
- `npx vite build` — production build succeeds (single ~390 kB gzip JS bundle; code-splitting is
  a reasonable follow-up, flagged by Vite's own chunk-size warning, not treated as a blocker here).

## Still open (as of end of Phase 1)

- Real Firebase project credentials (gap #3) needed to run the app or test suite against live
  data — set them in `.env` (see `.env.example`), never commit them.
- `components/ui/*` are functional but plain; restyle via shadcn once brand tokens are finalized.
- `vision-flower-engine.ts` / `motionEngine.ts` are working first passes, not verified against
  real product requirements for those two features.
- Phase 2 of the implementation plan (the Firestore/API migration for Moodoor's public
  projection) is unstarted.

---

# Phase 2 — Moodoor server-side projection & API migration

Implements the architecture from "Moodoor Matching Code Walkthrough and Platform Migration
Plan.md" Parts II-III: canonical `marketplace_listings` stays the source of truth, but the public
finder and the maker Studio's publish action no longer touch it directly from the browser.

## What changed

1. **`services/moodoor/core.ts`** (new) — the eligibility/scoring logic (`toMoodoorCandidate`,
   `toMoodoorListing`, `rankMoodoorMatches`, the mood/season/door vocabularies, the `0.78`/`0.42`
   thresholds) was extracted out of `services/moodoorMatching.ts` into an isomorphic module with
   **no Firestore import**, so the exact same code now runs both client-side (legacy) and
   server-side (new) — the migration plan's "shadow matching" phase has nothing left to diff
   because there's only one implementation. Also adds `toPublicMatch()`, which strips internal
   fields (`quality`, `isMoodoorPublished`, `publishedAt`, the numeric `score`) before a match
   crosses the API boundary, and `isMoodId`/`isSeasonId`/`isDoorId` guards for validating
   untrusted request bodies.
2. **`services/moodoorMatching.ts`** — now a thin client adapter re-exporting `core.ts`.
   `getMoodoorCatalog`/`getCreatorMoodoorListings`/`toMoodoorCandidate`/`toMoodoorListing`/
   `rankMoodoorMatches` keep their exact prior signatures (existing tests are untouched).
   `setMoodoorPublication()` no longer writes to Firestore directly — it now calls the new
   `PATCH /api/v1/moodoor/studio/listings/:id/publication` route with the signed-in maker's
   Firebase ID token.
3. **`services/firebase/moodoorProjection.ts`** (new, firebase-admin/server-only) —
   `rebuildMoodoorProjection()` builds the `moodoor_public_listings` read model from a canonical
   listing (or deletes the projection if the listing is no longer eligible);
   `getPublicMoodoorCatalog()` is the only Firestore read the public matcher performs;
   `setMoodoorPublicationServer()` is the publish/unpublish transaction — validates eligibility,
   flips `moodoorPublished`/`moodoorStatus` on the canonical record, rebuilds the projection, and
   appends an audit event to `moodoor_publication_events`, all atomically.
4. **`server.ts`** — two new routes:
   - `POST /api/v1/moodoor/matches` — public. Validates `{mood, season, door}` against the core
     module's enum guards, reads `moodoor_public_listings` (never `marketplace_listings`), ranks
     server-side, and returns `{ matches, catalogSize, noMatch }` — no raw score, per the
     migration plan's public response contract.
   - `PATCH /api/v1/moodoor/studio/listings/:id/publication` — verifies the caller's Firebase ID
     token (`admin.auth().verifyIdToken`), then runs the transaction above.
5. **`services/moodoorMatchesApi.ts`** (new) — client helper `fetchMoodoorMatches()` wrapping the
   new public route.
6. **`pages/Moodoor.tsx`** — `MoodoorFinder` now calls `fetchMoodoorMatches()` instead of
   `getMoodoorCatalog()` + client-side `rankMoodoorMatches()`; it no longer holds the full catalog
   in browser state, only the ranked public matches and a public `catalogSize` count (used for the
   "there are N approved wreaths" empty-state copy). `MoodoorStudio`'s publish/unpublish button is
   unchanged in the UI but now goes through the server transaction via the updated
   `setMoodoorPublication()`.
7. **`scripts/test-moodoor-projection.ts`** (new, `npm run test:moodoor-projection`) — covers the
   new API boundary: `toPublicMatch()` strips `quality`/`isMoodoorPublished`/`publishedAt`/`score`.

## Verified

- `npx tsc --noEmit` — still clean.
- `npm run test:moodoor-matching` — all 34 tests still pass unchanged (proves the `core.ts`
  extraction preserved the legacy client adapter's exact behavior).
- `npm run test:moodoor-projection` — both new boundary tests pass.
- `npx vite build` — still succeeds.

## Still open after Phase 2

- **Firestore security rules** haven't been written/deployed (this repo has no `firestore.rules`
  file at all yet) — until they exist and are deployed, `marketplace_listings` and
  `moodoor_public_listings` are only as protected as the Firebase project's current rules make
  them. Writing and deploying those rules per Part V of the migration plan ("Security Rules and
  Operational Controls") is the most important remaining step before this is production-safe.
- **No composite Firestore indexes** created yet for `moodoor_public_listings` — fine at small
  scale, but the migration plan calls for one on `(availability, publishedAt)` if public
  filtering/sorting is added later.
- **Backfill** — Phase 2 of the plan (batch-converting existing legacy `marketplace_listings`
  documents and populating `moodoor_public_listings` for already-published designs) hasn't run.
  `rebuildMoodoorProjection()` only fires on a fresh publish/unpublish action; existing published
  designs won't have a projection document until someone toggles them or a backfill script is
  written and run once against the real project.
- **No feature flags** (`moodoorServerMatches`, `moodoorPublicProjection`) — this migration went
  straight to the new code path rather than behind a flag, since there's no live traffic on this
  branch yet. Add them before deploying to an environment with real users, so a bad rollout can be
  flipped off without a revert.
- ~~Auth on the publication route checks the token is valid **and** that `creatorId` matches, but
  not tier/role~~ — closed in Phase 3 below.

---

# Phase 3 — Security hardening

Closes the security gaps Phase 2 left open: Firestore rules, tier gating on the publish route,
and rate limiting on the public matcher. Follows Part V ("Security Rules and Operational
Controls") of the migration plan doc.

## What changed

1. **`firestore.rules`** (new) — this repo had no rules file at all before now, so client SDK
   access to Firestore was governed only by whatever the live project's console rules happened to
   be. Added an explicit, deny-by-default rules file:
   - `marketplace_listings` — owner or admin only, matching `getCreatorMoodoorListings()`'s
     `creatorId` query.
   - `moodoor_public_listings` — public read, `write: if false` (only the Admin SDK, which
     bypasses rules, may write it — via `rebuildMoodoorProjection()`).
   - `moodoor_publication_events` and `schema_migrations` — no client access at all.
   - `users` — owners can read their own doc and create it (matching `AuthContext.tsx`'s
     first-sign-in write) but **cannot** set their own `role` or `tier` on create, and cannot
     change either on update — closes the hole where a signed-in client could otherwise grant
     itself `role: 'admin'` or a paid `tier` by writing its own user document.
   - `firebase.json` (new) points `firestore:` at this rules file so `firebase deploy
     --only firestore:rules` picks it up once run against a real project — that deploy step
     itself still needs to happen against your actual Firebase project; it's not something this
     repo can do on its own.
2. **`services/firebase/moodoorProjection.ts`** — `setMoodoorPublicationServer()` now also reads
   the caller's `users/{uid}` doc inside the same transaction and requires either `role === 'admin'`
   or `checkFeatureAccess(tier, 'hasDesignStudio')` (from the existing `services/tierService.ts`)
   before allowing a publish/unpublish — mirroring the client-side `TierGuard
   feature="hasDesignStudio"` gate already on the `/app/moodoor-studio` route, so the tier check
   isn't only cosmetic on the client.
   **Note:** `contexts/AuthContext.tsx`'s `UserData.tier` type (`'free' | 'pro' | 'studio' |
   'enterprise'`) doesn't actually match `tierService.ts`'s `Tier` union (`'free' | 'bloom' |
   'craft' | 'studio' | 'pro'`) — this mismatch predates this change and wasn't introduced by it,
   but it means a user document written with `tier: 'enterprise'` or `'pro'` won't resolve to
   any tier `checkFeatureAccess` recognizes as full access today except `'pro'` and `'studio'`,
   which happen to overlap. Worth reconciling before relying on this in production — flagged here
   rather than silently patched over, since it touches how every tier gate in the app resolves,
   not just Moodoor's.
3. **`services/rateLimiter.ts`** (new) — a minimal in-process fixed-window limiter (30
   requests/minute per IP by default), applied to `POST /api/v1/moodoor/matches` in `server.ts`
   (the plan's "rate-limit" requirement for the public matcher). Explicitly documented as
   per-process only — it does not share state across multiple server instances behind a load
   balancer; swap for a shared store (Redis, Firestore) before scaling beyond one instance.
4. **`scripts/test-rate-limiter.ts`** (new, `npm run test:rate-limiter`) — verifies the limiter
   allows traffic under the cap, returns 429 once exceeded, and tracks each IP independently.

## Verified

- `npx tsc --noEmit` — still clean.
- `npm run test:moodoor-matching` (34/34), `npm run test:moodoor-projection` (2/2),
  `npm run test:rate-limiter` (3/3) — all pass.
- `npx vite build` — still succeeds.

## Still open after Phase 3

- **The rules file has not been deployed.** Writing `firestore.rules` doesn't protect anything
  until `firebase deploy --only firestore:rules` runs against the real project — that requires
  Firebase CLI auth this sandboxed session doesn't have. Do this before treating any of the above
  as an actual security boundary.
- **The `UserData.tier` / `tierService.Tier` mismatch** noted above should be reconciled — right
  now it's possible for a real user's tier value to silently fail to match any known tier and be
  treated as `'free'` (safe-but-confusing) rather than raising a clear error.
- **No composite indexes, no backfill script, no feature flags** — still open from Phase 2 (see
  above); none of those are security issues specifically, so they weren't pulled into this pass.
- **Rate limiting is per-process** — fine for a single instance, not for a horizontally scaled
  deployment. No other route (e.g. `/blueprint/create`, which calls the Gemini API) has any rate
  limiting yet either; this pass only added it to the newly-added public Moodoor route.

---

# Phase 4 — Firebase → Supabase migration

Replaces Firebase (Auth + Firestore + Storage-for-motion) with Supabase across the whole app.
Trigger: uncertainty over whether the Firebase project/account was even still active, plus this
session having direct Supabase MCP access (able to inspect and migrate a real database) but no
equivalent Firebase access.

## What was found first (before touching anything)

- The "Evercrafted" Supabase project had a broken read-only DB role (password auth failing even
  after a manual reset) — not something fixable from this session.
- A second project, **"Final EcoSystem"** (`kxkvsrwpezusqvriftqv`, us-west-1), was already active
  and already had a real, populated schema for this exact app: `profiles`, `moodoor_collections`,
  `moodoor_packages`, `moodoor_lookbooks`, `blueprint_marketplace_listings`, `marketplace_apps`,
  etc. Confirmed with the user this is the real backend to build against.
- `moodoor_packages`/`moodoor_lookbooks` had **wide-open RLS** (`SELECT`/`INSERT`/`UPDATE`/`DELETE`
  all `qual: true` — anyone with the anon key could read/write/delete). Per the user's explicit
  instruction, **none of the existing tables were touched or copied** — this migration adds a
  separate, purpose-built set of tables instead, so that exposure is untouched/unaddressed by this
  work (flagged, not fixed, since it's out of scope for tables we don't own).
- The user asked to keep the existing mood/season/door matcher design (not the richer
  emotion-vector/territory model `moodoor_packages` actually uses) — so `services/moodoor/core.ts`
  and its scoring logic are unchanged; only the data-access layer moved to Postgres.

## New tables (via `supabase/migrations/0001_moodoor_and_app_tables.sql`, applied for real via MCP
— not just written to disk)

- `moodoor_listings` — canonical listing, Postgres equivalent of the old Firestore
  `marketplace_listings`. RLS: owner or admin can read/update; only owner can insert; only admin
  can delete.
- `moodoor_public_listings` — the public projection. RLS: public read; **no** insert/update/delete
  policy for any client role at all — only the service-role client or the
  `set_moodoor_publication()` function (`SECURITY DEFINER`, bypasses RLS) can write it.
- `moodoor_publication_events` — audit trail. No client policies at all.
- `set_moodoor_publication(listing_id, action)` — a Postgres function replacing
  `setMoodoorPublicationServer()`'s hand-rolled Firestore transaction: ownership check, role check
  (see note below), eligibility check on publish, projection upsert/delete, and audit insert, all
  in one atomic function body.
- `projects`, `inventory`, `saved_trends` — Postgres equivalents of the ad-hoc Firestore
  collections `MemoryWeaver`/`InventoryWeaver`/`ImageAnalyzer`/`Sourcing` wrote to. All RLS-scoped
  to owner-or-admin.
- A `generated-media` public Storage bucket was also created, replacing Firebase Storage for the
  motion-generation video pipeline in `server.ts`.

**Note on the role/tier check inside `set_moodoor_publication()`:** this schema has no per-creator
"Studio tier" entitlement — no tier column on `profiles`, and no `moodoor-studio` row in
`marketplace_apps`/`marketplace_app_subscriptions` (only `story-drop`, `inventory-weaver`,
`placement-intelligence` exist there). Publishing is gated on `current_role_is('admin')` (an
existing helper function in this DB) — i.e. only an owner/admin can release a listing today. This
is narrower than the original Firebase intent (any Studio-tier maker), documented rather than
papered over with a fabricated entitlement.

## Code changes

- `lib/supabase.ts` (browser client, anon key) + `services/supabaseAdmin.ts` (server-only,
  service-role key) replace `lib/firebase.ts`.
- `contexts/AuthContext.tsx` — Supabase Auth (`onAuthStateChange`, `signInWithOAuth('google')`)
  instead of Firebase Auth. No longer needs to manually create a user profile on first sign-in —
  the pre-existing `on_auth_user_created` trigger (`handle_new_user()`) already does that.
- `services/tierService.ts` — added `roleToTier()`, bridging `profiles.role`
  (`owner`/`admin`/`client`) to the existing `Tier` type so `Layout`/`TierGuard`'s
  `checkFeatureAccess()` calls keep working without a real tier column.
- `components/Layout.tsx` / `components/TierGuard.tsx` — swapped the hardcoded admin-bypass email
  check for a real `userData.role === 'admin' || 'owner'` check (the account in question already
  has `role: 'owner'` in the real `profiles` table).
- `services/moodoorMatching.ts` — reads/writes `moodoor_listings` via `supabase-js` instead of
  Firestore; `rowToMarketplaceDocument()` maps the clean Postgres row onto the same
  `MarketplaceDocument` shape `services/moodoor/core.ts`'s (unmodified, already-tested) adapter
  functions expect, so none of that logic needed rewriting.
- `services/supabaseMoodoorProjection.ts` replaces `services/firebase/moodoorProjection.ts`:
  `getPublicMoodoorCatalog()` reads the projection table; `setMoodoorPublicationServer()` calls
  the `set_moodoor_publication` RPC **as the calling user** (a per-request client built from their
  bearer token — not the service-role client), so the function's internal `auth.uid()` checks
  apply to them, not to a privileged identity.
- `services/firebase/marketplaceService.ts` was dead code (never imported anywhere) — deleted
  rather than ported.
- `server.ts` — Firebase Admin init replaced with `createSupabaseAdminClient()`; the motion-video
  route now reads/updates the `projects` table and uploads to the `generated-media` Storage bucket
  instead of Firestore + Firebase Storage; the publication route verifies the caller's Supabase
  access token via `db.auth.getUser()` and builds a per-caller client for the RPC call.
- `services/projectService.ts` — inserts into Supabase `projects` instead of Firestore.
- `pages/Sourcing.tsx`, `ImageAnalyzer.tsx`, `InventoryWeaver.tsx`, `MemoryWeaver.tsx` — their
  Firestore reads/writes (`inventory`, `savedTrends`) moved to the new Supabase tables;
  `InventoryWeaver`'s live Firestore `onSnapshot` listener became a Supabase Realtime
  `postgres_changes` channel subscription. `ImageAnalyzer`'s dead-code-adjacent
  `handleFirestoreError()`/`FirestoreErrorInfo` (which read Firebase-only fields like
  `emailVerified`/`tenantId`/`providerData`) was simplified to a backend-agnostic
  `handleDbError()`; the exact same unused helper in `MemoryWeaver.tsx` was dead code (never
  called) and was deleted outright.
- Every `user.uid` reference across these files became `user.id` (Supabase's `User` type has no
  `uid` field).
- `firestore.rules` and `firebase.json` deleted (no longer applicable). `.env.example` now
  documents `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (safe to share — not secret) and
  `SUPABASE_SERVICE_ROLE_KEY` (secret, server-only, left blank).
- `package.json` — added `@supabase/supabase-js`, removed `firebase` (client SDK). Kept
  `firebase-admin` out of the dependency list too since nothing uses it anymore after the motion
  route's storage migration.

## Verified

- `npx tsc --noEmit` — clean.
- `npm run test:moodoor-matching` — all 34 tests pass, running against the **real** Supabase
  project's anon key (not a mock).
- `npm run test:moodoor-projection`, `npm run test:rate-limiter` — pass unchanged.
- `npx vite build` — succeeds; bundle size actually dropped (~1.51 MB → ~1.04 MB, ~389 kB → ~275 kB
  gzip) now that the Firebase client SDK is gone.
- Migration applied for real via the Supabase MCP tools (`apply_migration`), not just written to
  a file — confirmed via `list_tables` that all 6 new tables exist with RLS enabled, alongside the
  pre-existing tables, untouched.

## Still open after Phase 4

- The exposed RLS on `moodoor_packages`/`moodoor_lookbooks` (pre-existing, not part of this
  migration's tables) is still open — flagged to the user, intentionally not touched.
- The role-only (no tier) gate on `set_moodoor_publication()` is narrower than the original
  Firebase-era design's intent; revisit once/if a real per-creator entitlement model exists.
- `SUPABASE_SERVICE_ROLE_KEY` must be supplied by the project owner in the real deployment
  environment — never committed, and this session never had or needed it (the RPC-as-caller
  pattern for publication avoids requiring the service-role key for that route entirely; only the
  public matches route and the motion-generation route use the admin client).
- No automated tests were added for the new Supabase-backed `AuthContext`, `projectService`,
  `inventory`/`saved_trends` flows, or the `set_moodoor_publication` Postgres function itself
  (beyond the pre-existing moodoor-matching/projection-boundary/rate-limiter suites, which all
  still pass) — worth adding, especially a test exercising the RPC function directly against a
  disposable listing.
