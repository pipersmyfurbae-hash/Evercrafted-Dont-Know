-- Public Storage bucket for server-generated media (currently: motion
-- video clips from src/services/motionEngine.ts via server.ts's
-- /motion/generate route). Replaces the Firebase Storage bucket the same
-- feature used before this migration.
insert into storage.buckets (id, name, public)
values ('generated-media', 'generated-media', true)
on conflict (id) do nothing;
