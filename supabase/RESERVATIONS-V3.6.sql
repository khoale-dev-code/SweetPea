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
