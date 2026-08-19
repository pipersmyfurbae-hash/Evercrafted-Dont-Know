# Evercrafted — Composition Engine Pipeline
## Slide Deck Content Outline

---

## Slide 1 — Title / Cover

**Headline:** Emotion becomes *engineered* design.

**Subheadline:** The Evercrafted Composition Engine Pipeline

**Body:** A deterministic 10-engine system that transforms a single emotional memory and a stem inventory into a mathematically balanced, reproducible wreath blueprint.

**Visual note:** Dark forest green (#4A6741) background, large Cormorant Garamond serif headline, Dancing Script italic accent on "engineered", botanical leaf SVG watermark, four stat pills at bottom: 10 Core Engines · 0.78 Min Score · 8 Repair Passes · 7 Score Metrics

---

## Slide 2 — The Pipeline at a Glance

**Headline:** Ten engines. One deterministic output.

**Body:** The pipeline executes sequentially — each engine feeds the next. No randomness escapes the system; every design is reproducible from its seed.

**Pipeline flow (10 steps):**
1. Memory Interpreter — Input Layer
2. Emotion Mapper — Signal Layer
3. Inventory Analyzer — Inventory Layer
4. Formula Selector — Selection Layer
5. Anchor Generator — Geometry Layer
6. Zone Field Builder — Zone Layer
7. Stem Allocator — Allocation Layer
8. Placement Solver — Placement Layer
9. Repair Engine — Repair Layer
10. Blueprint & Render Engine — Output Layer

**Visual note:** Vertical or horizontal flow diagram with numbered nodes connected by arrows, Evercrafted green accent color, off-white background

---

## Slide 3 — Engine 01: Memory Interpreter

**Overline:** 01 — Input Layer

**Headline:** Every design begins with a feeling.

**Body:** The Memory Interpreter is the emotional gateway. It parses free-form text — a memory, a mood, an occasion — into structured design intent that every downstream engine can consume.

**Input:** `"nostalgic cozy Christmas"`

**Output schema:**
```json
{
  "emotion":      "nostalgia",
  "energy":       0.4,
  "palette_bias": "warm",
  "symbolic_tags": ["evergreen", "berries", "pine_cone"]
}
```

**Key metrics:** Energy Level: 0.4 · Palette Bias: warm · Symbolic Tags: 3 · Parse Method: NLP

---

## Slide 4 — Engine 02 & 03: Emotion Mapper + Inventory Analyzer

**Overline:** 02–03 — Signal & Inventory Layers

**Headline:** Emotion becomes palette. Inventory becomes possibility.

**Left column — Emotion Mapper:**
Converts emotional intent into concrete design signals. A "nostalgic warm" emotion produces a deep red, pine green, and gold palette with moderate density bias and 0.7 contrast.

Output: `{ "palette": ["deep_red", "pine_green", "gold"], "contrast": 0.7, "density_bias": "moderate" }`

**Right column — Inventory Analyzer:**
Converts raw stem inventory into five role pools. Calculates average bloom diameter, stem length, and a flexibility score that determines how many formula options are viable.

Output: `{ "focal": 7, "secondary": 12, "accent": 9, "filler": 15, "greenery": 33 }` · Flexibility Score: 0.73

---

## Slide 5 — Engine 04: Formula Selector

**Overline:** 04 — Selection Layer

**Headline:** The strategic brain of the pipeline selects the optimal design structure.

**Body:** The Formula Selector scores every registered formula across six weighted dimensions. The formula with the highest composite score is selected. Confidence is recorded in the Blueprint DNA.

**Scoring model (weighted dimensions):**
| Dimension | Weight |
|---|---|
| Inventory Feasibility | 30% |
| Emotional Match | 20% |
| Silhouette | 15% |
| Negative Space | 15% |
| Complexity | 10% |
| Genome Compatibility | 10% |

**Result:** Selected Formula: `crescent` · Confidence: `0.84`

---

## Slide 6 — Engine 05 & 06: Anchor Generator + Zone Field Builder

**Overline:** 05–06 — Geometry & Zone Layers

**Headline:** Polar coordinates define where the design lives — and where it breathes.

**Left column — Anchor Generator:**
Transforms formula anchor group definitions into actual polar coordinates using seeded randomness. Every anchor is reproducible from the same seed.

Primary cluster: θ = 218.3°, r = 0.73 · Secondary cluster: θ = 247.1°, r = 0.71 · Seed: 92384723

**Right column — Zone Field Builder:**
Divides the wreath ring into angular sectors. Focal zones receive density targets of 0.9. The silence arc — intentional negative space — receives a density target of 0.1.

Focal arc: 210°–260°, density 0.9 · Silence arc: 280°–330°, density 0.1

**Key insight:** The silence arc is what makes the focal cluster feel powerful. Without intentional negative space, there is no focal point.

---

## Slide 7 — Engine 07: Stem Allocator

**Overline:** 07 — Allocation Layer

**Headline:** The 60/30/10 rule governs every stem count decision.

**Body:** The Stem Allocator distributes the total stem count across five roles using formula role bias ratios, adjusted for available inventory. The 60/30/10 proportion rule ensures structural integrity: 60% greenery skeleton, 30% secondary depth, 10% focal statement.

**Allocation table (60 total stems):**
| Role | Count | Ratio |
|---|---|---|
| Greenery | 21 | 35% |
| Secondary | 11 | 18% |
| Focal | 10 | 17% |
| Filler | 10 | 17% |
| Accent | 8 | 13% |

**Visual note:** Donut or bar chart showing role distribution with Evercrafted green palette

---

## Slide 8 — Engine 08: Placement Solver

**Overline:** 08 — Placement Layer

**Headline:** Every stem receives a precise polar address, depth layer, and direction vector.

**Body:** The Placement Solver assigns each stem its exact position in the design. Collision detection enforces minimum spacing as a multiple of bloom diameter — focal blooms require the most clearance to maintain visual dominance.

**Placement record example:**
```json
{
  "stem_id": "023",
  "role":    "secondary",
  "angle":   231.5,
  "radius":  0.72,
  "depth":   1,
  "vector":  245
}
```

**Spacing rules:**
- Focal: 1.3× bloom diameter
- Secondary: 1.0× bloom diameter
- Filler: 0.6× bloom diameter

**Depth hierarchy (bottom to top):** Gesture → Greenery → Filler → Accent → Secondary → Focal

---

## Slide 9 — Engine 09: Repair Engine

**Overline:** 09 — Repair Layer

**Headline:** The repair engine is what separates Evercrafted from a random generator.

**Body:** The Repair Engine runs up to 8 iterative improvement passes until the design scores ≥ 0.78. If the threshold is not reached after 8 passes, anchors regenerate with a new seed offset and the pipeline restarts.

**Four repair passes:**
1. **Density Normalization** — Redistributes stems to match zone field density targets. Overcrowded zones shed stems; sparse zones absorb them.
2. **Cluster Cohesion** — Pulls scattered stems toward their nearest anchor point, strengthening visual groupings.
3. **Silence Arc Enforcement** — Clears the designated silence arc of non-greenery stems, creating intentional negative space.
4. **Focal Clarity** — Ensures focal blooms are unobstructed, correctly depth-layered, and meet minimum angular separation.

**Convergence result:** Score before: 0.64 → Score after: 0.82 · Passes run: 3 · Threshold met: ✓

---

## Slide 10 — Scoring Engine

**Overline:** Quality Gate

**Headline:** A minimum overall score of 0.78 is required before any blueprint is approved.

**Body:** Every generated design is evaluated across seven professional composition metrics. The scoring engine is the quality gate — no blueprint exits the pipeline below threshold.

**Score breakdown:**
| Metric | Score |
|---|---|
| Balance | 0.83 |
| Rhythm | 0.79 |
| Contrast | 0.74 |
| Density | 0.81 |
| Focal Clarity | 0.86 |
| Negative Space | 0.77 |
| Inventory Efficiency | 0.91 |
| **Overall** | **0.82 ✓** |

**Status:** Score ≥ 0.78 threshold met. Blueprint approved for export.

---

## Slide 11 — Engine 10: Blueprint & Render Engine

**Overline:** 10 — Output Layer

**Headline:** One solved design. Four deliverables.

**Body:** The Blueprint & Render Engine serializes the entire solved placement set into four distinct outputs — each serving a different user need.

**Four output types:**
| Output | Format | Purpose |
|---|---|---|
| Blueprint JSON | `.json` | Machine-readable design record, versionable and resellable |
| Builder Guide | Markdown / PDF | Step-by-step placement instructions for the wreath maker |
| SVG Preview | `.svg` | Visual canvas preview of the polar placement layout |
| Render Prompt | Text | Midjourney-ready photorealistic render prompt |

**Builder guide steps:** Step 1: Place greenery skeleton → Step 2: Place focal blooms → Step 3: Place secondary blooms → Step 4: Add accents → Step 5: Fill with filler stems

---

## Slide 12 — Floral Genome Engine

**Overline:** Floral Intelligence

**Headline:** Every stem behaves like a design organism with traits, roles, and substitution neighbors.

**Body:** The Floral Genome Engine represents each stem as a structured design object. Genome records capture physical traits, emotional resonance, and a substitution chain — enabling the engine to find replacements when inventory is missing items.

**Example genome record (Rose Tamora — SKU 96532NT):**
- Bloom Diameter: 3.8" · Stem Length: 18"
- Role Capabilities: focal, secondary
- Gesture Type: cluster · Texture: velvet
- Emotion Tags: romantic, luxury
- Substitution Neighbors: English Garden Rose → Cabbage Rose → Ranunculus

**Substitution similarity weights:** 30% Bloom Size · 25% Gesture Type · 20% Texture · 15% Color Family · 10% Emotion Tags

---

## Slide 13 — Formula Registry

**Overline:** Composition Formulas

**Headline:** Six registered formulas define the structural vocabulary of Evercrafted wreaths.

**Body:** Each formula is a complete wreath structure definition — anchor groups, zone arcs, density curves, and role bias ratios. The Formula Selector scores all six and picks the optimal match for the current emotional intent and inventory.

**Registered formulas:**
| Formula ID | Name | Confidence (this run) |
|---|---|---|
| `crescent` | Crescent Sweep | 0.84 ✓ Selected |
| `focal_trio` | Focal Trio | 0.81 |
| `triangular` | Triangular Balance | 0.79 |
| `asymmetric` | Asymmetric Weight | 0.76 |
| `full_ring` | Full Ring | 0.71 |
| `cascade` | Cascade Drop | 0.67 |

**Formula schema key fields:** `anchor_groups`, `zone_definitions`, `density_curve`, `role_bias`

---

## Slide 14 — Blueprint DNA

**Overline:** Design Fingerprint

**Headline:** Every design is deterministic, versioned, and reproducible from its seed.

**Body:** Every generated blueprint receives a unique DNA fingerprint. Identical inputs — same memory prompt, same inventory, same formula — always regenerate the identical design. This enables product identification, blueprint resale, version control, and reproducible renders.

**Seed generation rule:**
```
seed = hash(memory_input + inventory_signature + formula_id)
```

**Blueprint DNA record:**
```json
{
  "formula":       "crescent",
  "seed":          92384723,
  "cluster_count": 2,
  "silence_arc":   [280, 330],
  "stem_count":    58,
  "palette":       ["deep_red", "pine_green", "gold"]
}
```

**Use cases:** Product catalog listing · Blueprint marketplace resale · Version history · Render reproduction

---

## Slide 15 — Full Pipeline Summary

**Overline:** End-to-End

**Headline:** From a single memory to a builder-ready blueprint in ten deterministic steps.

**Body:** The Composition Engine Pipeline is not a generator — it is a floral CAD system. Every decision is scored, every placement is calculated, and every output is reproducible.

**Complete pipeline summary:**
| # | Engine | Layer | Key Output |
|---|---|---|---|
| 01 | Memory Interpreter | Input | emotion, energy, palette_bias |
| 02 | Emotion Mapper | Signal | palette[], contrast, density_bias |
| 03 | Inventory Analyzer | Inventory | role_pools, flexibility_score |
| 04 | Formula Selector | Selection | selected_formula, confidence |
| 05 | Anchor Generator | Geometry | anchors[]{θ, r} |
| 06 | Zone Field Builder | Zone | zone_field[]{angle, density} |
| 07 | Stem Allocator | Allocation | allocation{focal…greenery} |
| 08 | Placement Solver | Placement | placements[]{θ, r, depth, vector} |
| 09 | Repair Engine | Repair | repaired_placements[], final_score |
| 10 | Blueprint & Render | Output | blueprint_json, builder_guide, svg |

---

## Slide 16 — API Surface

**Overline:** Integration Layer

**Headline:** Five endpoints expose the full pipeline as a callable API.

**Body:** Every engine in the pipeline is accessible via a RESTful API. Clients can generate, score, repair, render, and export blueprints independently — enabling third-party integrations and marketplace functionality.

**API endpoints:**
| Endpoint | Method | Purpose |
|---|---|---|
| `/generate-blueprint` | POST | Run the full 10-engine pipeline |
| `/score-blueprint` | POST | Score an existing placement set |
| `/repair-blueprint` | POST | Run repair passes on a scored blueprint |
| `/render-blueprint` | POST | Generate SVG preview and render prompt |
| `/export-blueprint` | POST | Export blueprint JSON and builder guide |

---

## Slide 17 — MVP Scope vs. Long-Term Vision

**Overline:** Roadmap

**Headline:** The MVP ships the engine. The vision ships the intelligence.

**Left column — MVP (Phase 1):**
- Inventory Analyzer
- Formula Selector
- Anchor Generator
- Placement Solver
- Repair Engine
- Scoring Engine
- Blueprint Generator
- Basic Render Preview

**Right column — Long-Term Systems:**
- AI Floral Image Analyzer
- Learning Memory Engine
- Formula Evolution
- Style Marketplace
- Genome Substitution Intelligence
- Blueprint Resale Platform

---

## Slide 18 — Closing / Vision

**Headline:** Evercrafted is a floral CAD system — a design intelligence platform.

**Body:** The Composition Engine Pipeline is the foundation of a new category: procedural floral design. Where other tools generate suggestions, Evercrafted produces mathematically balanced, emotionally resonant, reproducible blueprints — every time.

**Closing statement:** *Emotion + Inventory = Engineered Design.*

**Visual note:** Dark green background, large Cormorant Garamond serif, Dancing Script accent, botanical SVG watermark, Evercrafted wordmark

---

*Total slides: 18*
*Audience: Technical stakeholders, product team, investors*
*Tone: Editorial, precise, confident — Kinfolk meets SaaS engineering*
