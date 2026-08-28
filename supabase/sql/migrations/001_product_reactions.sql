-- Migracion 001: reacciones Me gusta / Me encanta en product_likes
-- Ejecutar SOLO si ya corriste setup.sql antes (proyecto Supabase existente).
-- Puedes pegarlo en una nueva pestana del SQL Editor del MISMO proyecto.
-- Es seguro ejecutarlo mas de una vez (idempotente).

create extension if not exists pgcrypto;

-- 1) Columna reaction_type (like | love)
alter table if exists public.product_likes
add column if not exists reaction_type text not null default 'love';

-- 2) Validacion de valores permitidos
alter table if exists public.product_likes
drop constraint if exists product_likes_reaction_type_check;

alter table if exists public.product_likes
add constraint product_likes_reaction_type_check
check (reaction_type in ('like', 'love'));

-- 3) Realtime: necesario para que los contadores se actualicen en vivo
alter table public.product_likes replica identity full;

-- 4) Indice util si aun no existe (no rompe si ya esta)
create index if not exists product_likes_product_id_idx
on public.product_likes (product_id);

-- PASO MANUAL en el panel de Supabase (no se hace con SQL):
-- Database -> Replication -> activar "product_likes" en Realtime.
