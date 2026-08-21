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
- Auth on the publication route checks the token is valid **and** that `creatorId` on the
  canonical listing matches the caller's uid (403 otherwise) — but it does not yet check the
  caller's tier/role. Tier gating (mirroring what `TierGuard`/`checkFeatureAccess` already do
  client-side for `hasDesignStudio`/`hasCreatorUpload`) still needs to move into
  `setMoodoorPublicationServer()` — right now any signed-in owner of a listing can publish it to
  Moodoor regardless of subscription tier.
