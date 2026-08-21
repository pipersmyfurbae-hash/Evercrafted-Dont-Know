-- Stores the motion-generation result (server.ts's /motion/generate route)
-- against the project it was generated for.
alter table public.projects add column motion jsonb;
