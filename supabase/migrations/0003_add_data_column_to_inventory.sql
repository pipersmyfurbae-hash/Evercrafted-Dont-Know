-- Extra per-item analysis fields captured by pages/ImageAnalyzer.tsx
-- (bloom diameter, stem length, cost, supplier SKU, description, SVG,
-- image data URL) that don't warrant their own dedicated columns.
alter table public.inventory add column data jsonb;
