# Evercrafted Subscription Tier System

## Tiers

| # | Name        | Core Apps Included |
|---|-------------|-------------------|
| 1 | **Bloom**   | Tutorial guides, seasonal lookbook |
| 2 | **Craft**   | + Inventory tracker, pricing calculator |
| 3 | **Studio**  | + Blueprint generator, collection builder |
| 4 | **Atelier** | + AI visualizer, prompt creator, all future apps |

À la carte and bundle pricing also available.

## Tier Card Pattern (HTML)

```html
<div class="tier-card tier-card--recommended">
  <div class="tier-badge ec-tier-studio">Studio</div>
  <div class="tier-name">Studio</div>
  <div class="tier-price"><span class="tier-price__amount">$49</span>/mo</div>
  <div class="tier-tagline">For the working wreath artist</div>
  <ul class="tier-features">
    <li class="tier-feature tier-feature--included">Blueprint Generator</li>
    <li class="tier-feature tier-feature--included">Collection Builder</li>
    <li class="tier-feature tier-feature--locked">
      <span class="lock-icon">🔒</span> AI Visualizer
      <span class="upgrade-hint">Atelier only</span>
    </li>
  </ul>
  <button class="ec-btn ec-btn-primary">Get Started</button>
</div>
```

## Rules for Locked Features

- **Always show** locked features — never hide them entirely
- Use lock icon + muted text + subtle blur overlay
- Include upgrade hint ("Atelier only") inline
- CTA on locked features: "Upgrade to Atelier →"

## Recommended Tier Highlighting

- Scale up: `transform: scale(1.04)` on recommended card
- Elevated shadow: `--ec-shadow-hero`
- "Most Popular" badge at top, using `--ec-green` background
