# Plan: Merge Moodoor Studio into the Evercrafted Platform

## Goal

Integrate the attached **Moodoor Studio** archive into the existing **Evercrafted** platform as a coherent product surface, rather than copying it in as an isolated prototype. The merged result will preserve Moodoor as the consumer-facing, mood-led discovery brand while using Evercrafted as the source of truth for wreath designs, inventory availability, composition quality, and blueprint intelligence.

> **Product boundary already established in the current Evercrafted site:** Evercrafted is the maker-facing design platform; Moodoor is the consumer-facing brand that matches a customer’s desired home feeling to an available wreath. They must retain distinct presentation layers while sharing the same design and stock data.

The execution will use the existing static multi-page site as the initial deployment shape. Existing reserved Moodoor routes (`moodoor/moodoor.html`, `moodoor/quiz.html`, and `moodoor/result.html`) will be treated as the canonical integration points unless the archive audit establishes that a framework-based migration is necessary and justified.

## Current Evidence and Assumptions

| Item | Current understanding | Planning implication |
|---|---|---|
| Evercrafted platform | Existing project is static HTML-first, with a sitemap and dedicated Moodoor route family. | Favor a route/page integration rather than an unbounded framework rewrite. |
| Moodoor’s role | A customer answers three mood, season/occasion, and door-style questions; the platform matches an available wreath in under 60 seconds. | The imported experience must connect to a quiz-to-match flow, not only add visual pages. |
| Shared intelligence | Moodoor should draw from Evercrafted inventory, blueprint/design records, balance checks, and mood signals. | Introduce explicit shared schemas and adapters; do not duplicate inventory or manually mirror design records. |
| Brand relationship | Moodoor is a separate, consumer-facing sister brand with its own audience and voice. | Keep Moodoor’s consumer editorial identity while maintaining shared design tokens, accessibility standards, and cross-links. |
| Moodoor Studio archive | The ZIP could not be safely inspected with the currently available read-only attachment tooling. | Start execution with a non-executing archive manifest and compatibility audit before adopting any code or dependencies. |

## Target Outcome

The merger will produce an integrated Moodoor experience with the following product flow:

1. A customer enters Moodoor from Evercrafted or a direct consumer route.
2. The customer completes a concise three-question mood quiz: desired feeling, season/occasion, and door context.
3. The quiz response is normalized into an internal **Mood Profile**; no wreath-design terminology is exposed to the customer.
4. The matching layer filters the shared Evercrafted catalogue for in-stock, publishable designs and ranks candidates by emotion, season, palette/door compatibility, inventory status, and blueprint quality.
5. Moodoor presents a transparent, plain-language match explanation, an editorial product/story experience, and the appropriate product or purchase action.
6. Makers continue to manage stock, design metadata, blueprints, and publishing status in Evercrafted. Changes automatically affect Moodoor eligibility.

## Planned Architecture

### Integration Principle

Adopt **shared data, separate experiences**:

- **Evercrafted** remains the maker/operations surface: inventory, blueprint records, floral genomes, quality scores, catalogue publication controls, and product management.
- **Moodoor** becomes the consumer discovery and storytelling surface: mood quiz, results, editorial story drops, and customer-safe product cards.
- A narrow, documented **Moodoor Adapter** converts Evercrafted records into consumer-safe presentation data. No Moodoor page should read raw inventory, cost, supplier, or internal scoring details directly.

### Route and Surface Map

| Route / surface | Purpose after merger | Primary owner |
|---|---|---|
| `moodoor/moodoor.html` | Consumer landing page explaining the mood-led proposition and directing visitors into the quiz. | Moodoor presentation layer |
| `moodoor/quiz.html` | Three-step mood capture, progress feedback, validation, and no-account-required entry point. | Moodoor matching layer |
| `moodoor/result.html` | Ranked match result, explanation, availability state, alternative matches, and product CTA. | Moodoor matching layer |
| `moodoor/stories/[slug]` or static equivalent | Optional editorial Story Drop pages sourced from published blueprint/product metadata. | Moodoor story layer |
| Evercrafted design/inventory surfaces | Publishing controls, availability, blueprint quality, and product metadata. | Evercrafted operations layer |
| Shared matching module | Deterministic transform and ranker for quiz answers against publishable inventory/design records. | Shared platform layer |

The exact file placement and routing convention will be confirmed during the archive audit so that the imported code follows the repository’s existing conventions rather than introducing parallel infrastructure.

### Canonical Data Contract

| Shared object | Evercrafted source fields | Moodoor-safe output | Rules |
|---|---|---|---|
| `MoodProfile` | Derived from quiz answers | mood, emotional tags, season/occasion, door attributes, palette preference | Store only what is necessary for the session or approved analytics; no unnecessary personal data. |
| `PublishedWreath` | blueprint ID, title, formula, palette, emotional tags, season, image/render, price, availability, quality score | title, story, palette, formula-derived consumer descriptors, image, price, availability, URL | Never expose raw polar coordinates, supplier details, internal inventory counts, or unreleased designs. |
| `MatchResult` | deterministic ranked candidate list | primary match, up to two alternates, natural-language reason, CTA state | Exclude unavailable, unpublished, or below-quality-threshold designs before ranking. |
| `StoryDrop` | approved published blueprint + narrative metadata + render assets | consumer editorial page content and gallery images | Preserve linked blueprint/version identifier for traceability while keeping internal data private. |
| `InventoryAvailability` | available-to-sell state and publication eligibility | in stock / limited / unavailable | Do not expose counts or maker operational data. |

### Match Model, Version 1

Implement a transparent deterministic baseline before adding generative or opaque recommendations:

| Criterion | Initial behavior |
|---|---|
| Mood alignment | Compare quiz mood tags to published design emotional tags. |
| Season/occasion fit | Prefer explicit seasonal or occasion tags; penalize conflicts. |
| Door/palette compatibility | Compare door characteristics with palette contrast and tone metadata. |
| Availability | Hard filter: only designs eligible and available to sell can rank. |
| Design quality | Hard or weighted gate using the Evercrafted blueprint score threshold (minimum 0.78 where applicable). |
| Editorial diversity | Avoid showing near-duplicate alternatives. |
| Explanation | Generate from the selected matching factors in plain, customer-friendly language. |

## Execution Plan

### Phase 1 — Safe Archive and Repository Discovery

1. Create a read-only manifest of `moodoor-studio.zip`: files, directory layout, file types, package manifests, build scripts, assets, environment variable references, third-party libraries, and license notices. Do **not** execute scripts or install packages merely because they are present in the archive.
2. Classify the archive as one of the following:
   - a static Moodoor consumer experience;
   - a creator/authoring tool called “Studio”; or
   - a mixed application containing both consumer and internal flows.
3. Compare the archive’s implementation style, dependencies, and routes against the Evercrafted repository’s static route layout, sitemap, current Moodoor pages, and existing brand tokens.
4. Produce a merge matrix identifying each archive file as **adopt**, **adapt**, **replace**, **extract assets only**, or **exclude**. Record the justification for every dependency and any questionable code.
5. Identify collisions: duplicate route names, competing CSS variables, global selectors, duplicated quiz logic, conflicting analytics, overlapping assets, hardcoded copy, and references to unavailable APIs.
6. Confirm whether Moodoor Studio already contains customer quiz, result, story-drop, catalogue, admin, or checkout patterns; map each to the target route and data contract above.

**Exit criterion:** a signed-off integration map identifies exactly what is being merged and proves that untrusted archive code has not been executed.

### Phase 2 — Product and Information Architecture Reconciliation

1. Preserve the existing Evercrafted → Moodoor distinction in navigation, ownership language, and visual presentation. Moodoor will be introduced as a linked consumer destination—not relabeled as a maker-facing Evercrafted app.
2. Reconcile the archive’s navigation, terminology, and calls to action with the canonical flow: landing → three-question quiz → match result → editorial product/story page → purchase or maker-defined handoff.
3. Define the publishing lifecycle for a wreath: **draft → scored → approved → publishable → available → sold out/unavailable → archived**. Only the last three eligible states are visible to Moodoor.
4. Define the source of every result-page field, including product image, title, price, availability, story line, palette language, match reason, and alternate products.
5. Set the initial entitlement rule: Moodoor is a marketplace/distribution channel for paid Evercrafted makers; consumer use of the quiz should not require an Evercrafted subscription. Any maker-only Studio controls remain inside Evercrafted’s paid-plan experience.
6. Decide which Moodoor Studio capabilities are MVP vs. deferred. The MVP should prioritize a truthful, available, mood-matched catalogue; AI door preview, gift mode, embeddable quiz builder, and advanced personalisation remain post-launch unless already complete and compatible in the archive.

**Exit criterion:** approved page map, user-flow map, ownership model, MVP boundary, and a field-level data dictionary.

### Phase 3 — Shared Data and Matching Layer

1. Define or add canonical model fields for Moodoor metadata to Evercrafted design records: publish state, consumer title, story line, season, mood/emotional tags, door-fit palette attributes, product imagery, retail price, and availability eligibility.
2. Implement a single adapter that converts approved Evercrafted data into `PublishedWreath` objects for Moodoor. Centralize filtering and field redaction in this adapter.
3. Implement `MoodProfile` normalization for the three quiz answers. Maintain a controlled vocabulary for mood, season/occasion, door type, and palette tone so the matching logic is reproducible and testable.
4. Implement the deterministic ranking model and explainability template. It must return the selected result, alternates, score components for internal diagnostics, and a consumer-safe explanation.
5. Link `StoryDrop` records to their originating design/blueprint version so a story page remains accurate as the design evolves, is unpublished, or becomes unavailable.
6. Add documented API or static-data boundaries consistent with the actual repository architecture discovered in Phase 1. Avoid inventing a second backend if the existing platform already provides a supported data path.

**Exit criterion:** a fixture-driven matching flow returns only in-stock, publishable, quality-approved results with a clear reason for every decision.

### Phase 4 — Experience Merge and Design-System Harmonisation

1. Bring approved Moodoor Studio components, assets, and interaction patterns into the agreed Moodoor routes. Refactor instead of copy-pasting global styles, scripts, and duplicate utilities.
2. Create a narrowly scoped Moodoor theme layer that preserves its editorial consumer feel while using shared accessibility, typography, spacing, and token conventions. It must not break existing Evercrafted maker surfaces.
3. Build or adapt the landing page, quiz, and result UI. The quiz must be keyboard accessible, mobile-responsive, stateful only for the current flow, and capable of graceful empty, loading, error, and sold-out states.
4. Build the match result view with a primary match, up to two non-duplicative alternatives, rationale, current availability, and a truthful CTA. Include a “try another mood” reset path.
5. Integrate the approved Moodoor Story Drop patterns for published products where the archive supports them. Preserve the required editorial structure and ensure imagery has clear source/placeholder handling.
6. Add cross-links and contextual handoffs: Evercrafted maker dashboard → publish/manage Moodoor listing; Moodoor product pages → only the permitted consumer purchase or inquiry action.
7. Ensure that all visual material continues to respect wreath construction: availability and scoring should reflect real inventory, role hierarchy, meaningful negative space, formula geometry, and feasible builder-ready designs—not decorative mock data.

**Exit criterion:** the consumer journey feels native to Moodoor, the maker workflow remains native to Evercrafted, and both surfaces reflect the same source data without manual duplication.

### Phase 5 — Quality Assurance, Security, and Migration

1. Run automated and manual regression checks across existing Evercrafted pages and all Moodoor routes. Validate all internal links, navigation, mobile breakpoints, reduced-motion behavior, keyboard navigation, focus states, contrast, and page performance.
2. Validate matching fixtures for all six stated moods, every seasonal/occasion choice, each door profile, low-stock/unavailable conditions, no-match conditions, and duplicate-match prevention.
3. Test data safety: unpublished designs never surface; sold-out designs are excluded; raw inventory counts, cost data, supplier data, and internal blueprint coordinates never reach consumer pages.
4. Perform static dependency and secret scanning on archive-derived code. Remove unused libraries, unapproved external calls, test credentials, and inaccessible third-party CDN requirements.
5. Preserve existing Moodoor URLs where possible. If paths must change, add redirects and update sitemap/navigation references. Do not replace active pages without a rollback copy.
6. Add data migration/import scripts only after the field mapping is approved; ensure they are repeatable, idempotent, logged, and reversible.

**Exit criterion:** acceptance suite passes, migration is repeatable, no data leakage or stale availability state is present, and rollback instructions are documented.

### Phase 6 — Rollout and Post-Launch Measurement

1. Release behind a feature flag or staged route where the existing platform permits. Start with a controlled subset of published, in-stock wreaths and a small number of Story Drops.
2. Monitor quiz completion rate, time-to-result, no-match rate, primary-match click-through, alternate-match usage, purchase/inquiry conversion, unavailable-result incidents, and maker publication success.
3. Review mismatches with makers and customer feedback, then tune the controlled vocabulary and deterministic matching weights—not the underlying blueprint quality threshold—before introducing more complex recommendation logic.
4. Document operational ownership: who publishes designs, resolves stale stock, approves stories, maintains the mood taxonomy, and handles customer support or marketplace issues.

**Exit criterion:** Moodoor demonstrates reliable matching and availability accuracy for the controlled catalogue, with clear measurement evidence for expanding the product.

## Validation Plan

| Test category | Required checks |
|---|---|
| Archive compatibility | No unreviewed scripts executed; all adopted files have an owner and disposition. |
| Routing | Existing Evercrafted and reserved Moodoor URLs resolve correctly; no broken navigation or duplicate routes. |
| Data consistency | Every Moodoor card/result maps to one published Evercrafted design; availability and publish status agree. |
| Matching | Correct deterministic winner, alternates, and explanation across representative quiz fixtures. |
| Inventory safety | Out-of-stock, unpublished, invalid, and below-threshold designs never appear in results. |
| Design quality | Candidate product metadata maps to feasible, scored Evercrafted blueprints with coherent formula, palette, and material data. |
| UI/UX | Quiz completes in three clear steps; result is readable, responsive, keyboard accessible, and understandable without design jargon. |
| Brand | Moodoor remains consumer/editorial; Evercrafted remains maker/operational; token and visual regressions are absent. |
| Performance | Landing, quiz, and result pages meet agreed loading budgets without unnecessary archive dependencies. |
| Rollback | Existing routes/pages and data can be restored without data loss. |

## Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Archive is a different framework or contains unmaintained build tooling | Audit first; adopt concepts/components selectively instead of forcing a platform rewrite. |
| Moodoor Studio overlaps or conflicts with existing Moodoor routes | Use the route map and merge matrix; choose one canonical implementation per route. |
| Duplicated or stale inventory data leads to bad customer matches | Make Evercrafted the only source of availability and filter at the adapter layer. |
| Internal composition/inventory data leaks to consumer pages | Enforce a consumer-safe `PublishedWreath` contract; do not serialize raw internal records into the UI. |
| Consumer experiences become too technical | Keep polar placement, genomes, and scoring behind the scenes; translate value into mood, material, silhouette, and home context. |
| Brand dilution | Use scoped Moodoor presentation tokens and shared accessibility primitives rather than forcing one visual identity onto both brands. |
| Archive contains unsafe or licensed third-party materials | Review all dependencies, assets, and licenses before importing; exclude anything without clear provenance. |

## Decisions Required Before Implementation Begins

The requested plan assumes that “merge” means a **product integration of Moodoor Studio into Evercrafted**, with the archive’s approved code and assets becoming part of the repository. Before execution, confirm the following only if the archive audit reveals ambiguity:

1. Whether Moodoor Studio is intended to be **consumer-facing**, **maker-facing**, or both.
2. Whether Moodoor should use Evercrafted’s existing static site architecture for the first release or whether the archive contains a required, maintainable runtime that merits a deliberate migration.
3. The preferred consumer purchase handoff: external shop URL, inquiry workflow, embedded commerce, or a placeholder while commerce is not yet live.
4. Whether Story Drops should ship in the initial merge or follow immediately after the quiz-to-match MVP.

## Definition of Done

The merger is complete when Moodoor Studio is no longer a disconnected archive: a visitor can complete a three-question mood quiz and receive a transparent, in-stock, quality-approved wreath match sourced from the same Evercrafted design and inventory records that makers manage; the experience is branded, responsive, accessible, test-covered, deployment-safe, and reversible.

## Out of Scope for the Initial Merge

- Rebuilding the entire Evercrafted platform in a new framework solely to accommodate the archive.
- Live AI door compositing, gift mode, and embeddable partner quizzes unless they are already production-ready, compatible, and explicitly approved after the audit.
- Directly exposing internal blueprint coordinates, genome traits, supplier information, raw inventory quantities, costs, or engine score details to consumers.
- Migrating or purchasing external commerce, analytics, or AI services without separate approval.

## Sources Consulted

- Current Evercrafted Moodoor product section (`evercrafted-marketing.html`, lines 1134–1337).
- Existing Evercrafted static route inventory and Moodoor route convention.
- Evercrafted App Builder guidance and tier catalogue.
- Moodoor Story Drop workflow and its shared-data/editorial architecture.
- The attached `moodoor-studio.zip` file reference; archive content inspection is deferred to the first non-mutating execution phase because it could not be opened with the available read-only attachment reader.

---

**Implementation starts only after this plan is approved.**
