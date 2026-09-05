-- Sweet Pea baseline schema for Supabase Postgres.
-- Run once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.shop_settings (
  id smallint primary key default 1 check (id = 1),
  name text not null,
  tagline text not null default '',
  description text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  map_url text not null default '',
  zalo_url text not null default '',
  opening_text text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '',
  price numeric(12, 0) not null default 0 check (price >= 0),
  image_url text not null default '',
  is_featured boolean not null default false,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_categories_public_order_idx
  on public.menu_categories (is_visible, sort_order);

create index if not exists menu_items_public_order_idx
  on public.menu_items (is_available, category_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shop_settings_updated_at on public.shop_settings;
create trigger shop_settings_updated_at before update on public.shop_settings
for each row execute function public.set_updated_at();

drop trigger if exists menu_categories_updated_at on public.menu_categories;
create trigger menu_categories_updated_at before update on public.menu_categories
for each row execute function public.set_updated_at();

drop trigger if exists menu_items_updated_at on public.menu_items;
create trigger menu_items_updated_at before update on public.menu_items
for each row execute function public.set_updated_at();

alter table public.shop_settings enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;

drop policy if exists "Public can read shop settings" on public.shop_settings;
create policy "Public can read shop settings"
on public.shop_settings for select
to anon, authenticated
using (true);

drop policy if exists "Public can read visible categories" on public.menu_categories;
create policy "Public can read visible categories"
on public.menu_categories for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "Public can read available menu items" on public.menu_items;
create policy "Public can read available menu items"
on public.menu_items for select
to anon, authenticated
using (
  is_available = true
  and exists (
    select 1 from public.menu_categories category
    where category.id = category_id and category.is_visible = true
  )
);

grant usage on schema public to anon, authenticated;
grant select on public.shop_settings, public.menu_categories, public.menu_items to anon, authenticated;

insert into public.shop_settings (
  id, name, tagline, description, phone, email, address, map_url, zalo_url, opening_text
) values (
  1,
  'Sweet Pea',
  'Freshly baked daily · Est. 2022',
  'Một tiệm bánh nhỏ xinh, nơi mỗi chiếc bánh được làm mới trong ngày và gói ghém bằng thật nhiều dịu dàng.',
  '032 824 3949',
  'nguyenthikimthoa14032000@gmail.com',
  'Hẻm 17, đường 786, ấp Thạnh Thuận, xã Thanh Điền, huyện Châu Thành, Tây Ninh',
  'https://maps.google.com/?q=H%E1%BA%BBm+17+%C4%91%C6%B0%E1%BB%9Dng+786+T%C3%A2y+Ninh',
  'https://zalo.me/0328243949',
  'Nhận đặt bánh mỗi ngày'
) on conflict (id) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  map_url = excluded.map_url,
  zalo_url = excluded.zalo_url,
  opening_text = excluded.opening_text;

insert into public.menu_categories (id, name, slug, description, sort_order, is_visible) values
  ('00000000-0000-4000-8000-000000000001', 'Bánh ngọt', 'banh-ngot', 'Bánh mềm, kem nhẹ và vị ngọt vừa đủ.', 1, true),
  ('00000000-0000-4000-8000-000000000002', 'Bánh nướng', 'banh-nuong', 'Thơm mùi bơ, ngon nhất khi dùng trong ngày.', 2, true),
  ('00000000-0000-4000-8000-000000000003', 'Thức uống', 'thuc-uong', 'Một chút mát lành để ăn bánh vui hơn.', 3, true)
on conflict (id) do nothing;

insert into public.menu_items (
  category_id, name, description, price, image_url, is_featured, is_available, sort_order
) values
  ('00000000-0000-4000-8000-000000000001', 'Bánh kem dâu', 'Cốt bánh vanilla mềm, kem sữa thanh nhẹ và dâu tươi.', 165000, '', true, true, 1),
  ('00000000-0000-4000-8000-000000000001', 'Tiramisu', 'Mascarpone béo dịu, cacao thơm và cà phê cân bằng.', 55000, '', true, true, 2),
  ('00000000-0000-4000-8000-000000000002', 'Croissant bơ', 'Vỏ giòn nhiều lớp, ruột mềm và thơm bơ.', 39000, '', true, true, 3),
  ('00000000-0000-4000-8000-000000000003', 'Matcha latte', 'Matcha thơm đậm, sữa tươi và vị ngọt nhẹ.', 49000, '', false, true, 4),
  ('00000000-0000-4000-8000-000000000003', 'Trà đào Sweet Pea', 'Trà thanh, đào giòn và hương cam dịu mát.', 45000, '', false, true, 5);

-- No public write policies. Admin writes use the server-only service role.

-- SWEET PEA RESERVATIONS V3.6
-- Sweet Pea table reservations v3.6
-- Run once in Supabase Dashboard > SQL Editor before testing the booking form.

create table if not exists public.table_reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (char_length(phone) between 8 and 24),
  reservation_date date not null,
  reservation_time time not null,
  guest_count integer not null check (guest_count between 1 and 30),
  seating_preference text not null default 'any'
    check (seating_preference in ('any', 'garden', 'indoor')),
  note text not null default '' check (char_length(note) <= 400),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists table_reservations_schedule_idx
  on public.table_reservations (reservation_date, reservation_time);

create index if not exists table_reservations_status_created_idx
  on public.table_reservations (status, created_at desc);

drop trigger if exists table_reservations_updated_at on public.table_reservations;
create trigger table_reservations_updated_at
before update on public.table_reservations
for each row execute function public.set_updated_at();

alter table public.table_reservations enable row level security;

-- Customer data is never exposed directly to browser Supabase clients.
-- Public booking goes through the Next.js server route with the service role.
revoke all on table public.table_reservations from anon, authenticated;
grant select, insert, update, delete on table public.table_reservations to service_role;

comment on table public.table_reservations is
  'Customer table reservation requests created from the Sweet Pea website.';
