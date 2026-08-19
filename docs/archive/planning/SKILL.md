---
name: evercrafted-app-builder
description: >
  Build, design, and extend Evercrafted client-facing apps — purchasable feature modules
  for a wreath-making subscription platform. Use this skill whenever building or improving
  any Evercrafted app, tool, or feature: wreath blueprint generators, inventory trackers,
  subscription managers, tutorial guides, seasonal collection builders, or AI-powered
  visualizer/prompt creators. Trigger for requests like "build an Evercrafted app",
  "create a new feature for clients", "make a wreath tool", "add this to Evercrafted",
  "build the blueprint generator", "subscription tier feature", or any request to create
  or improve a purchasable module for the Evercrafted platform. Always apply the
  Evercrafted brand identity — never build a generic-looking app.
---

# Evercrafted App Builder Skill

This skill governs the design, development, and extension of all Evercrafted client apps —
purchasable feature modules that wreath-making subscribers buy individually, in bundles,
or as part of tiered plans.

## Reference Files

| Topic | File |
|-------|------|
| Brand identity, design tokens, UI components | `references/brand-and-design.md` |
| App catalogue, feature specs, tier logic | `references/app-catalogue.md` |
| Claude API integration patterns | `references/ai-integration.md` |

**Always read `references/brand-and-design.md` first** — every app must look unmistakably Evercrafted.
Then read the catalogue and AI reference as needed for the specific app being built.

---

## Core Principles

1. **Brand before everything** — every pixel should feel like it belongs to Evercrafted. No generic UI kits, no off-brand colors, no Lorem Ipsum.
2. **One file per app** — all HTML, CSS, and JS in a single artifact file. Clean, portable, installable.
3. **Tier-aware** — every app knows which subscription tier it belongs to. Features unavailable at a client's tier are visible but locked with a clear upgrade prompt, never hidden.
4. **AI is an enhancement, not a crutch** — only add Claude API features where they genuinely elevate the experience (blueprint generation, prompt creation, design suggestions). Simple tools stay simple.
5. **Wreath domain fluency** — apps should speak the language of wreath makers: polar coordinates, grapevine vs pine, focal flowers, seasonal collections, etc. Pull knowledge from the `wreath-fundamentals` skill when needed.

---

## Subscription Tiers

| Tier | Name | Included Apps |
|------|------|---------------|
| 1 | **Bloom** | Tutorial guides, seasonal style lookbook |
| 2 | **Craft** | + Inventory tracker, pricing calculator |
| 3 | **Studio** | + Blueprint generator, collection builder |
| 4 | **Atelier** | + AI visualizer, prompt creator, all future apps |

À la carte pricing is also available — individual apps can be purchased outside a tier.
Bundle packs group 2–3 related apps at a discount.

When building an app, always:
- Mark its tier clearly in the app header
- Show locked features to lower-tier users with an upgrade CTA
- Never fully hide premium content — show a teaser + lock icon

---

## App Build Checklist

Before delivering any Evercrafted app:
- [ ] Brand tokens applied from `references/brand-and-design.md`
- [ ] App tier badge visible in header
- [ ] Locked features shown with upgrade prompt (if applicable)
- [ ] Mobile-responsive layout
- [ ] Empty states handled gracefully
- [ ] Loading and error states styled on-brand
- [ ] No raw hex colors outside the token system
- [ ] Botanical or line art accent used at least once
- [ ] Script font used for at least one decorative heading or label
