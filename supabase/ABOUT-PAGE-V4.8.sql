-- Sweet Pea About Page v4.8
-- Run once in Supabase Dashboard > SQL Editor.

create table if not exists public.about_page_content (
  id integer primary key default 1 check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.about_page_content enable row level security;

drop policy if exists "Public can read about page content"
  on public.about_page_content;

create policy "Public can read about page content"
on public.about_page_content
for select
to anon, authenticated
using (true);

grant select on table public.about_page_content to anon, authenticated;
grant select, insert, update on table public.about_page_content to service_role;

insert into public.about_page_content (id, content)
values (
  1,
  $json$
  {
    "hero": {
      "eyebrow": "Về Sweet Pea",
      "title": "Một góc vườn nhỏ,",
      "accent": "nhiều điều dịu dàng.",
      "description": "Sweet Pea là một tiệm bánh & café mang tinh thần sân vườn — nơi mùi bánh mới, ly nước mát và những tán cây xanh cùng tạo nên một khoảng dừng nhẹ nhàng cho mỗi cuộc hẹn.",
      "primary_label": "Khám phá không gian",
      "secondary_label": "Xem menu",
      "badge_title": "Sân vườn",
      "badge_text": "Một khoảng xanh để ngồi thật lâu.",
      "media": {
        "type": "image",
        "url": "/images/about/sweet-pea-lemon-garden.webp",
        "alt": "Không gian sân vườn Sweet Pea với cây xanh và khu trưng bày trái vàng"
      }
    },
    "story": {
      "eyebrow": "Câu chuyện của Sweet Pea",
      "title": "Nơi những ngày bình thường cũng có thể trở nên đáng nhớ.",
      "paragraph_1": "Sweet Pea lớn lên từ tình yêu dành cho những khu vườn, những chiếc bánh vừa ra lò và cảm giác dễ chịu của một buổi chiều không cần vội.",
      "paragraph_2": "Tiệm không cố gắng trở thành một nơi quá cầu kỳ. Chúng mình chỉ muốn mỗi góc ngồi, từng chiếc bánh và từng ly nước đều đủ chỉn chu để bạn cảm thấy thoải mái khi ghé qua.",
      "paragraph_3": "Dù là một buổi hẹn, một buổi làm việc hay vài phút dành riêng cho mình, Sweet Pea luôn mong bạn tìm thấy một khoảng thật nhẹ ở đây.",
      "media_left": {
        "type": "image",
        "url": "/images/about/sweet-pea-garden-house.webp",
        "alt": "Lối vào xanh mát của Sweet Pea"
      },
      "media_right": {
        "type": "image",
        "url": "/images/about/sweet-pea-plaid-table.webp",
        "alt": "Bàn ghế ngoài trời tại Sweet Pea"
      }
    },
    "highlights": [
      {
        "title": "Không gian sân vườn",
        "text": "Nhiều cây xanh, khoảng thở và ánh sáng tự nhiên để bạn chậm lại một chút giữa ngày."
      },
      {
        "title": "Bánh & nước làm mỗi ngày",
        "text": "Từng món được chuẩn bị theo nhịp nhỏ, ưu tiên sự tươi mới, vừa vị và cảm giác thân thuộc."
      },
      {
        "title": "Góc ngồi ấm cúng",
        "text": "Có những góc riêng tư cho buổi hẹn, làm việc nhẹ nhàng hoặc đơn giản là ngồi yên một lúc."
      }
    ],
    "gallery": {
      "eyebrow": "Một vòng quanh tiệm",
      "title": "Không gian tại Sweet Pea",
      "description": "Từ hiên nhỏ, khu vườn đến tủ bánh — mỗi góc đều giữ một chút chất mộc và sự gần gũi riêng.",
      "items": [
        {
          "id": "garden-main",
          "caption": "Góc vườn xanh",
          "media": {
            "type": "image",
            "url": "/images/about/sweet-pea-lemon-garden.webp",
            "alt": "Góc sân vườn Sweet Pea dưới tán cây và những giỏ trái vàng"
          }
        },
        {
          "id": "garden-house",
          "caption": "Lối nhỏ vào tiệm",
          "media": {
            "type": "image",
            "url": "/images/about/sweet-pea-garden-house.webp",
            "alt": "Lối nhỏ xanh mát dẫn vào không gian Sweet Pea"
          }
        },
        {
          "id": "garden-view",
          "caption": "Ngồi thật chậm",
          "media": {
            "type": "image",
            "url": "/images/about/sweet-pea-garden-view.webp",
            "alt": "Từ hiên Sweet Pea nhìn ra khu vườn và bàn ghế ngoài trời"
          }
        },
        {
          "id": "plaid-table",
          "caption": "Một chiếc bàn nhỏ",
          "media": {
            "type": "image",
            "url": "/images/about/sweet-pea-plaid-table.webp",
            "alt": "Bàn ghế gỗ và hoa trong khu sân vườn Sweet Pea"
          }
        },
        {
          "id": "pastry-case",
          "caption": "Bánh mới mỗi ngày",
          "media": {
            "type": "image",
            "url": "/images/about/sweet-pea-pastry-case.webp",
            "alt": "Tủ bánh với các món bánh nướng tại Sweet Pea"
          }
        }
      ]
    },
    "quote": {
      "text": "Nơi những buổi hẹn trở nên nhẹ nhàng hơn.",
      "description": "Một chiếc bàn nhỏ, một món mình thích và đủ thời gian để chuyện trò.",
      "media": {
        "type": "image",
        "url": "/images/about/sweet-pea-garden-view.webp",
        "alt": "Không gian nhìn ra khu vườn Sweet Pea"
      }
    }
  }
  $json$::jsonb
)
on conflict (id) do nothing;

comment on table public.about_page_content is
  'Editable content and media configuration for the Sweet Pea About page.';
