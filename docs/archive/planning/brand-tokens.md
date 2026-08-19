# Evercrafted Brand Tokens

## Color System

```css
:root {
  --ec-white:        #FFFFFF;
  --ec-off-white:    #F9F7F4;
  --ec-paper:        #F2EFE9;
  --ec-black:        #1A1A1A;
  --ec-charcoal:     #2E2E2E;
  --ec-ink:          #4A4A4A;

  --ec-green:        #4A6741;
  --ec-green-light:  #6B8F67;
  --ec-green-pale:   #EEF2ED;
  --ec-green-dim:    rgba(74, 103, 65, 0.12);

  --ec-gray-100:     #F5F5F5;
  --ec-gray-200:     #E8E8E8;
  --ec-gray-300:     #D0D0D0;
  --ec-gray-400:     #A8A8A8;
  --ec-gray-500:     #787878;

  --ec-warning:      #C4922A;
  --ec-error:        #B94040;
  --ec-info:         #4A6785;

  --ec-surface:      var(--ec-white);
  --ec-surface-alt:  var(--ec-off-white);
  --ec-surface-warm: var(--ec-paper);
  --ec-border:       var(--ec-gray-200);
  --ec-border-dark:  var(--ec-gray-300);
  --ec-text:         var(--ec-black);
  --ec-text-muted:   var(--ec-ink);
  --ec-text-faint:   var(--ec-gray-500);
}
```

## Typography

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Dancing+Script:wght@600&family=Inter:wght@400;500;600&family=DM+Mono&display=swap" rel="stylesheet">
```

```css
:root {
  --ec-font-serif:  'Cormorant Garamond', Georgia, serif;
  --ec-font-sans:   'Inter', system-ui, sans-serif;
  --ec-font-script: 'Dancing Script', cursive;
  --ec-font-mono:   'DM Mono', monospace;
}
```

## Spacing

```css
:root {
  --ec-space-1:  0.25rem;
  --ec-space-2:  0.5rem;
  --ec-space-3:  0.75rem;
  --ec-space-4:  1rem;
  --ec-space-5:  1.5rem;
  --ec-space-6:  2rem;
  --ec-space-8:  2.5rem;
  --ec-space-10: 3rem;
  --ec-space-12: 4rem;

  --ec-radius-sm:   4px;
  --ec-radius-md:   8px;
  --ec-radius-lg:   14px;
  --ec-radius-xl:   20px;
  --ec-radius-full: 9999px;

  --ec-shadow-sm:   0 1px 3px rgba(0,0,0,0.06);
  --ec-shadow-md:   0 4px 16px rgba(0,0,0,0.08);
  --ec-shadow-lg:   0 8px 32px rgba(0,0,0,0.10);
  --ec-shadow-hero: 0 24px 64px rgba(0,0,0,0.10);

  --ec-transition:  200ms ease;
}
```

## Subscription Tiers

| Tier    | Class              | Background | Text Color |
|---------|--------------------|------------|------------|
| Bloom   | `.ec-tier-bloom`   | #EEF2ED    | #4A6741    |
| Craft   | `.ec-tier-craft`   | #EEF4F9    | #4A6785    |
| Studio  | `.ec-tier-studio`  | #F5EEF4    | #7A4A85    |
| Atelier | `.ec-tier-atelier` | #1A1A1A    | #F2EFE9    |

## Botanical SVG Accent (leaf sprig)

```html
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--ec-green)">
  <path d="M16 28 C16 28 8 20 8 12 C8 7.6 11.6 4 16 4 C20.4 4 24 7.6 24 12 C24 20 16 28 16 28Z"
        stroke="currentColor" stroke-width="1.5" fill="none"/>
  <path d="M16 28 L16 10" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>
  <path d="M16 18 C16 18 12 16 10 13" stroke="currentColor" stroke-width="1" fill="none"/>
  <path d="M16 14 C16 14 20 12 22 9" stroke="currentColor" stroke-width="1" fill="none"/>
</svg>
```
