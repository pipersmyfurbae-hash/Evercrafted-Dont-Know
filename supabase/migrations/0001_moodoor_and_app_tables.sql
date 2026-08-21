-- Moodoor matching + supporting app tables, built fresh alongside the
-- existing schema (moodoor_collections / moodoor_packages / moodoor_lookbooks
-- / blueprint_marketplace_listings are untouched — this is a separate,
-- purpose-built set of tables for the mood/season/door matcher and the
-- generic design-save flow, migrating those features off Firebase/Firestore.

-- ─── Canonical Moodoor listing ──────────────────────────────────────────
create table public.moodoor_listings (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id),
  title text not null,
  summary text not null default '',
  image_url text,
  price numeric,
  season_tags text[] not null default '{}',
  mood_tags text[] not null default '{}',
  palette_tags text[] not null default '{}',
  formula text,
  marketplace_status text not null default 'draft'
    check (marketplace_status in ('draft', 'published', 'archived')),
  availability text not null default 'in_stock'
    check (availability in ('in_stock', 'limited', 'unavailable')),
  quality_score numeric,
  quality_approved boolean not null default false,
  moodoor_published boolean not null default false,
  moodoor_status text not null default 'private'
    check (moodoor_status in ('private', 'published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger moodoor_listings_set_updated_at
  before update on public.moodoor_listings
  for each row execute function public.set_updated_at();

alter table public.moodoor_listings enable row level security;

create policy moodoor_listings_owner_or_admin_read
  on public.moodoor_listings for select
  using (creator_id = auth.uid() or public.current_role_is('admin'));

create policy moodoor_listings_owner_insert
  on public.moodoor_listings for insert
  with check (creator_id = auth.uid());

create policy moodoor_listings_owner_or_admin_update
  on public.moodoor_listings for update
  using (creator_id = auth.uid() or public.current_role_is('admin'))
  with check (creator_id = auth.uid() or public.current_role_is('admin'));

create policy moodoor_listings_admin_delete
  on public.moodoor_listings for delete
  using (public.current_role_is('admin'));

-- ─── Public projection ──────────────────────────────────────────────────
-- Public read-only. No insert/update/delete policy for anon/authenticated
-- at all — only the server's service-role client (which bypasses RLS
-- entirely) or the set_moodoor_publication() function below may write it.
create table public.moodoor_public_listings (
  listing_id uuid primary key references public.moodoor_listings(id) on delete cascade,
  title text not null,
  summary text not null,
  hero_image_url text,
  price_amount numeric,
  price_currency text not null default 'USD',
  availability text not null check (availability in ('in_stock', 'limited')),
  formula text,
  mood_tags text[] not null default '{}',
  season_tags text[] not null default '{}',
  palette_tags text[] not null default '{}',
  published_at timestamptz not null default now()
);

alter table public.moodoor_public_listings enable row level security;

create policy moodoor_public_listings_public_read
  on public.moodoor_public_listings for select
  using (true);

-- ─── Publication audit trail ────────────────────────────────────────────
-- No client policies at all: unreadable and unwritable except via the
-- service-role client / SECURITY DEFINER functions, which bypass RLS.
create table public.moodoor_publication_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.moodoor_listings(id),
  action text not null check (action in ('publish', 'unpublish')),
  actor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.moodoor_publication_events enable row level security;

-- ─── Atomic publish/unpublish ────────────────────────────────────────────
-- SECURITY DEFINER so it can write moodoor_public_listings and
-- moodoor_publication_events despite their restrictive RLS above; it
-- re-implements the authorization checks itself rather than relying on the
-- (bypassed) RLS policies. Mirrors setMoodoorPublicationServer() from the
-- Firestore version: ownership check, eligibility check on publish,
-- projection rebuild, audit event — all in one transaction (a single
-- plpgsql function body is atomic).
--
-- NOTE: this schema has no per-creator "Studio tier" entitlement (no
-- moodoor-studio row in marketplace_apps, no tier column on profiles), so
-- publishing is gated on current_role_is('admin') — i.e. only an
-- owner/admin can release a listing to Moodoor today. If/when a real
-- per-creator entitlement exists, replace that check accordingly.
create or replace function public.set_moodoor_publication(p_listing_id uuid, p_action text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_listing public.moodoor_listings%rowtype;
  v_result text;
begin
  if p_action not in ('publish', 'unpublish') then
    raise exception 'action must be ''publish'' or ''unpublish''';
  end if;

  select * into v_listing from public.moodoor_listings where id = p_listing_id for update;
  if not found then
    raise exception 'Listing not found.';
  end if;

  if v_listing.creator_id is distinct from auth.uid() then
    raise exception 'You do not own this listing.';
  end if;

  if not public.current_role_is('admin') then
    raise exception 'Your account does not include Moodoor Studio publishing.';
  end if;

  if p_action = 'publish' then
    if v_listing.marketplace_status <> 'published'
      or v_listing.availability = 'unavailable'
      or not (v_listing.quality_approved or coalesce(v_listing.quality_score, 0) >= 0.78) then
      raise exception 'Listing is not eligible for Moodoor (must be published, available, and quality-approved).';
    end if;
  end if;

  update public.moodoor_listings
    set moodoor_published = (p_action = 'publish'),
        moodoor_status = case when p_action = 'publish' then 'published' else 'unpublished' end
    where id = p_listing_id;

  if p_action = 'publish' then
    insert into public.moodoor_public_listings (
      listing_id, title, summary, hero_image_url, price_amount, price_currency,
      availability, formula, mood_tags, season_tags, palette_tags, published_at
    ) values (
      v_listing.id, v_listing.title, v_listing.summary, v_listing.image_url, v_listing.price, 'USD',
      v_listing.availability, v_listing.formula, v_listing.mood_tags, v_listing.season_tags, v_listing.palette_tags, now()
    )
    on conflict (listing_id) do update set
      title = excluded.title,
      summary = excluded.summary,
      hero_image_url = excluded.hero_image_url,
      price_amount = excluded.price_amount,
      availability = excluded.availability,
      formula = excluded.formula,
      mood_tags = excluded.mood_tags,
      season_tags = excluded.season_tags,
      palette_tags = excluded.palette_tags,
      published_at = now();
    v_result := 'published';
  else
    delete from public.moodoor_public_listings where listing_id = v_listing.id;
    v_result := 'revoked';
  end if;

  insert into public.moodoor_publication_events (listing_id, action, actor_id)
    values (p_listing_id, p_action, auth.uid());

  return v_result;
end;
$$;

-- ─── Generic design-save flow (Memory/Inventory/Image weaver pages) ─────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  name text not null,
  source text not null,
  blueprint jsonb,
  render text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy projects_owner_or_admin_all
  on public.projects for all
  using (user_id = auth.uid() or public.current_role_is('admin'))
  with check (user_id = auth.uid() or public.current_role_is('admin'));

-- ─── Inventory items (Sourcing / Inventory Weaver / Image Analyzer) ─────
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  sku text,
  name text not null,
  category text,
  color text,
  stock integer not null default 0,
  role text,
  created_at timestamptz not null default now()
);

alter table public.inventory enable row level security;

create policy inventory_owner_or_admin_all
  on public.inventory for all
  using (user_id = auth.uid() or public.current_role_is('admin'))
  with check (user_id = auth.uid() or public.current_role_is('admin'));

-- ─── Saved emotion/blueprint trends (Memory Weaver) ─────────────────────
create table public.saved_trends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  name text not null,
  data jsonb,
  created_at timestamptz not null default now()
);

alter table public.saved_trends enable row level security;

create policy saved_trends_owner_or_admin_all
  on public.saved_trends for all
  using (user_id = auth.uid() or public.current_role_is('admin'))
  with check (user_id = auth.uid() or public.current_role_is('admin'));
