# Extraction Status — Phase 0

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
