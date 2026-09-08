-- Sweet Pea Homepage Content v4.4
-- Run once in Supabase Dashboard > SQL Editor.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.homepage_content (
  id smallint primary key default 1 check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists homepage_content_updated_at on public.homepage_content;
create trigger homepage_content_updated_at
before update on public.homepage_content
for each row execute function public.set_updated_at();

alter table public.homepage_content enable row level security;

drop policy if exists "Public can read homepage content" on public.homepage_content;
create policy "Public can read homepage content"
on public.homepage_content for select
to anon, authenticated
using (true);

grant select on public.homepage_content to anon, authenticated;
grant select, insert, update, delete on public.homepage_content to service_role;

insert into public.homepage_content (id, content)
values (
  1,
  '{
    "hero": {
      "eyebrow": "Sweet Pea · Bakery & Café",
      "title": "Một góc xanh,",
      "accent_title": "một ngày dịu hơn.",
      "description": "Một tiệm bánh nhỏ xinh, nơi mỗi chiếc bánh được làm mới trong ngày và gói ghém bằng thật nhiều dịu dàng.",
      "primary_label": "Khám phá menu",
      "primary_href": "/menu",
      "secondary_label": "Xem không gian",
      "secondary_href": "/about",
      "chips": ["Nhận đặt bánh mỗi ngày", "Bánh mới mỗi ngày", "Sân vườn xanh"],
      "main_media": {"type":"image","url":"/images/home-v27/sweet-pea-lemon-garden.webp","alt":"Không gian sân vườn Sweet Pea"},
      "bubble_media": {"type":"image","url":"/images/home-v27/sweet-pea-pastry-case.webp","alt":"Tủ bánh tại Sweet Pea"},
      "media_label": "Góc sân vườn Sweet Pea",
      "sticker_title": "Bánh mới mỗi sáng",
      "sticker_text": "nướng tại tiệm, giòn thơm"
    },
    "space": {
      "eyebrow": "Không gian Sweet Pea",
      "title": "Một khu vườn nhỏ để ngồi lâu hơn một chút.",
      "description": "Có cây xanh, những góc bàn nhỏ và mùi bánh mới. Dù ghé một mình hay đi cùng bạn bè, Sweet Pea vẫn giữ một nhịp thật chậm, thoáng và dễ chịu.",
      "chips": ["Sân vườn xanh", "Góc ngồi yên", "Bánh mới mỗi ngày"],
      "cta_label": "Khám phá câu chuyện",
      "cta_href": "/about",
      "main_media": {"type":"image","url":"/images/home-v27/sweet-pea-garden-house.webp","alt":"Khu vườn và lối vào Sweet Pea"},
      "top_media": {"type":"image","url":"/images/home-v27/sweet-pea-garden-view.webp","alt":"Góc nhìn từ bàn ngồi ra sân vườn"},
      "bottom_media": {"type":"image","url":"/images/home-v27/sweet-pea-pastry-case.webp","alt":"Tủ bánh Sweet Pea"},
      "main_label": "Góc vườn xanh",
      "top_label": "Ngồi thật chậm",
      "bottom_label": "Bánh mới mỗi ngày"
    }
  }'::jsonb
)
on conflict (id) do nothing;

comment on table public.homepage_content is
  'Editable Sweet Pea homepage hero and space content/media.';
