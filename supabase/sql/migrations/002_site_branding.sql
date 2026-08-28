-- Migracion 002: foto hero y logotipo configurables desde el admin
-- Ejecutar en el MISMO proyecto Supabase si ya corriste setup.sql antes.

alter table if exists public.site_settings
add column if not exists hero_background_url text not null default '';

alter table if exists public.site_settings
add column if not exists logo_url text not null default '';

update public.site_settings
set hero_background_url = coalesce(
  nullif(hero_background_url, ''),
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
)
where id = 1;
