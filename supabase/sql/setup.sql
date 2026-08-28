create extension if not exists pgcrypto;

create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  description text default '',
  icon text default 'UtensilsCrossed',
  sort_order integer default 0,
  accent text default '#ef4444',
  cover_image text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  category_slug text not null references public.categories(slug) on update cascade on delete restrict,
  sort_order integer not null default 0,
  name text not null,
  description text default '',
  price integer not null default 0,
  image_url text default '',
  rating integer not null default 5 check (rating between 1 and 5),
  tag text,
  is_featured boolean not null default false,
  is_popular boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.products
add column if not exists sort_order integer not null default 0;

create table if not exists public.site_settings (
  id integer primary key default 1,
  restaurant_name text not null default 'El Pollon',
  location_label text not null default 'Iquique, Chile',
  hero_title text not null default 'Carta digital moderna',
  hero_subtitle text not null default 'Pollo a la brasa, combos, extras y bebidas.',
  whatsapp_url text not null default 'https://wa.me/56986925310',
  delivery_url text not null default 'https://www.el-pollon.cl',
  address text not null default 'Vivar 1086, Iquique',
  schedule text not null default 'Lun - Dom | 11:00 - 23:00',
  primary_color text not null default '#ef4444',
  secondary_color text not null default '#111111',
  hero_background_url text not null default '',
  logo_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table if exists public.site_settings
add column if not exists hero_background_url text not null default '';

alter table if exists public.site_settings
add column if not exists logo_url text not null default '';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories
for select
to public
using (true);

drop policy if exists "Authenticated can manage categories" on public.categories;
create policy "Authenticated can manage categories"
on public.categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products
for select
to public
using (is_active = true);

drop policy if exists "Authenticated can manage products" on public.products;
create policy "Authenticated can manage products"
on public.products
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings"
on public.site_settings
for select
to public
using (true);

drop policy if exists "Authenticated can manage settings" on public.site_settings;
create policy "Authenticated can manage settings"
on public.site_settings
for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Authenticated can upload product images" on storage.objects;
create policy "Authenticated can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated can update product images" on storage.objects;
create policy "Authenticated can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated can delete product images" on storage.objects;
create policy "Authenticated can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');

create table if not exists public.analytics_visits (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  visited_at timestamptz not null default now()
);

create index if not exists analytics_visits_visited_at_idx
on public.analytics_visits (visited_at desc);

create table if not exists public.product_likes (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  session_id text not null,
  reaction_type text not null default 'love' check (reaction_type in ('like', 'love')),
  created_at timestamptz not null default now(),
  unique (product_id, session_id)
);

alter table if exists public.product_likes
add column if not exists reaction_type text not null default 'love';

alter table if exists public.product_likes
drop constraint if exists product_likes_reaction_type_check;

alter table if exists public.product_likes
add constraint product_likes_reaction_type_check
check (reaction_type in ('like', 'love'));

create index if not exists product_likes_product_id_idx
on public.product_likes (product_id);

alter table public.analytics_visits enable row level security;
alter table public.product_likes enable row level security;

drop policy if exists "Public can insert visits" on public.analytics_visits;
create policy "Public can insert visits"
on public.analytics_visits
for insert
to public
with check (true);

drop policy if exists "Authenticated can read visits" on public.analytics_visits;
create policy "Authenticated can read visits"
on public.analytics_visits
for select
to authenticated
using (true);

drop policy if exists "Public can manage own likes" on public.product_likes;
create policy "Public can manage own likes"
on public.product_likes
for all
to public
using (true)
with check (true);

drop policy if exists "Authenticated can read likes" on public.product_likes;
create policy "Authenticated can read likes"
on public.product_likes
for select
to authenticated
using (true);

alter table public.product_likes replica identity full;

