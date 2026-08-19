# Evercrafted App Catalogue & Feature Specs

## App Roster

Each app entry defines: tier, purpose, core features, locked (upgrade) features, and UI notes.

---

### 🌸 1. Tutorial Guide App
**Tier**: Bloom (Tier 1) — included in all plans
**Purpose**: Step-by-step wreath-making lessons with visuals and progress tracking

**Core features**:
- Browse tutorials by skill level (Beginner / Intermediate / Advanced)
- Step-by-step instructions with image slots per step
- Progress checkboxes — mark steps complete
- Estimated time and materials list per tutorial
- Seasonal filter (Spring / Summer / Fall / Winter)

**Locked features (Craft+)**:
- Download PDF version of tutorial
- Save custom notes per step

**Locked features (Studio+)**:
- Video embed slots per step
- "Build from this tutorial" button → launches Blueprint Generator with pre-filled values

**UI notes**:
- Card grid layout for tutorial browser
- Individual tutorial uses a vertical stepper component
- Progress bar at top of tutorial view
- Botanical divider between major sections

---

### 📦 2. Inventory & Materials Tracker
**Tier**: Craft (Tier 2)
**Purpose**: Track stems, supplies, and materials across wreath projects

**Core features**:
- Add/edit/delete inventory items (name, category, quantity, unit, reorder threshold)
- Category filter: Greenery / Florals / Accents / Bases / Tools / Ribbon
- Low stock alerts (items below reorder threshold highlighted)
- Quick-add from a project's materials list

**Locked features (Studio+)**:
- Usage history per item (which wreaths used it)
- Auto-deduct stock when a blueprint is marked complete

**Locked features (Atelier)**:
- AI reorder suggestions: "You're low on eucalyptus — here's where to reorder"
- Seasonal demand forecast ("You'll likely need X more stems for fall season")

**UI notes**:
- Table layout with inline editing
- Color-coded stock status: green (ok) / amber (low) / red (critical)
- Category chips for filtering
- Add item panel slides in from right

---

### 💰 3. Pricing & Cost Calculator
**Tier**: Craft (Tier 2)
**Purpose**: Calculate cost of materials and suggested retail price per wreath

**Core features**:
- Add line items: material name, quantity used, unit cost
- Auto-calculate: total material cost, labor cost (rate × hours), overhead %
- Suggested retail price at 2.5× and 3× markup
- Save calculations as named estimates

**Locked features (Studio+)**:
- Pull materials directly from Inventory Tracker
- Export estimate as PDF quote

**Locked features (Atelier)**:
- AI pricing advisor: "Based on your market and this wreath complexity, here's a recommended price range"

**UI notes**:
- Clean table with totals row
- Markup sliders
- Summary card showing cost / suggested price / profit margin

---

### 🌿 4. Wreath Blueprint Generator
**Tier**: Studio (Tier 3)
**Purpose**: Generate precise polar-coordinate placement blueprints for wreath designs

**Core features**:
- Input: wreath size (small/medium/large or custom), base type (grapevine/pine)
- Input: number of focal points, filler elements, accent elements
- Output: placement table with (r, θ) coordinates for each element
- Visual ring diagram showing element positions
- Print/export blueprint

**Locked features (Atelier)**:
- AI blueprint generation: describe the wreath in words → Claude generates the full blueprint
- "Suggest elements" based on season and style

**UI notes**:
- Two-panel layout: controls left, blueprint preview right
- SVG ring diagram with labeled dot positions
- Blueprint table below diagram
- Use `--ec-font-mono` for coordinate values

---

### 🍂 5. Seasonal Collection Builder
**Tier**: Studio (Tier 3)
**Purpose**: Curate and organize seasonal wreath collections (designs, palettes, elements)

**Core features**:
- Create named collections (e.g. "Fall 2025", "Holiday Edit")
- Add wreath designs to a collection (title, description, image slot, element list)
- Tag designs with season, style, difficulty
- View collection as a mood board grid

**Locked features (Atelier)**:
- AI collection naming and description generator
- "Complete this collection" — AI suggests missing pieces based on existing designs
- Export collection as a client-facing lookbook PDF

**UI notes**:
- Mood board grid — masonry-style card layout
- Cover image is prominent per card
- Minimal text — let images lead
- Script font for collection name

---

### ✨ 6. AI Visualizer & Prompt Creator
**Tier**: Atelier (Tier 4)
**Purpose**: Generate rich image prompts for AI art tools (Midjourney, DALL·E, etc.)
and describe wreath visualizations based on blueprint or description input

**Core features**:
- Input: wreath style, season, color palette, base type, key elements
- Output: detailed image generation prompt (Midjourney-style)
- Output: plain-language description of the finished wreath
- Prompt history — save and revisit past prompts
- One-click copy to clipboard

**AI features (all Atelier — all require Claude API)**:
- Generate prompt from free-text description
- Refine prompt ("make it more rustic", "add more depth")
- Generate 3 prompt variations from one input
- "Reverse describe" — paste a prompt, get element list back

**UI notes**:
- Clean two-column: input left, output right
- Output uses a monospace or serif block for the prompt text
- Copy button prominent on output
- Variation cards shown side by side

---

## Shared App Patterns

### Empty state (no data yet)
```html
<div class="ec-empty">
  <div class="ec-empty__icon">🌿</div>
  <p class="ec-empty__title">Nothing here yet</p>
  <p class="ec-empty__desc">Add your first item to get started.</p>
  <button class="ec-btn ec-btn-green">Get Started</button>
</div>
```

### Upgrade CTA (for locked features)
```html
<div class="ec-lock-badge">
  <div class="ec-script" style="font-size:1rem; margin-bottom:6px">Studio Feature</div>
  <p style="font-size:0.8125rem; color:#4A4A4A; margin-bottom:12px">
    Upgrade to Studio to unlock the Blueprint Generator
  </p>
  <button class="ec-btn ec-btn-primary" style="font-size:0.8125rem">
    Upgrade Plan →
  </button>
</div>
```

### Section intro (script accent + serif heading)
```html
<div class="ec-section-intro">
  <span class="ec-script">Your</span>
  <h2 class="ec-heading">Blueprint Collection</h2>
  <p class="ec-body">Design and save repeatable wreath layouts with precise placement.</p>
</div>
```
