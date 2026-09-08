import type { HomeMedia, HomePageContent } from "./homepage-types";

export const DEFAULT_HOME_PAGE_CONTENT: HomePageContent = {
  hero: {
    eyebrow: "Sweet Pea · Bakery & Café",
    title: "Một góc xanh,",
    accent_title: "một ngày dịu hơn.",
    description:
      "Một tiệm bánh nhỏ xinh, nơi mỗi chiếc bánh được làm mới trong ngày và gói ghém bằng thật nhiều dịu dàng.",
    primary_label: "Khám phá menu",
    primary_href: "/menu",
    secondary_label: "Xem không gian",
    secondary_href: "/about",
    chips: ["Nhận đặt bánh mỗi ngày", "Bánh mới mỗi ngày", "Sân vườn xanh"],
    main_media: {
      type: "image",
      url: "/images/home-v27/sweet-pea-lemon-garden.webp",
      alt: "Không gian sân vườn Sweet Pea",
    },
    bubble_media: {
      type: "image",
      url: "/images/home-v27/sweet-pea-pastry-case.webp",
      alt: "Tủ bánh tại Sweet Pea",
    },
    media_label: "Góc sân vườn Sweet Pea",
    sticker_title: "Bánh mới mỗi sáng",
    sticker_text: "nướng tại tiệm, giòn thơm",
  },
  space: {
    eyebrow: "Không gian Sweet Pea",
    title: "Một khu vườn nhỏ để ngồi lâu hơn một chút.",
    description:
      "Có cây xanh, những góc bàn nhỏ và mùi bánh mới. Dù ghé một mình hay đi cùng bạn bè, Sweet Pea vẫn giữ một nhịp thật chậm, thoáng và dễ chịu.",
    chips: ["Sân vườn xanh", "Góc ngồi yên", "Bánh mới mỗi ngày"],
    cta_label: "Khám phá câu chuyện",
    cta_href: "/about",
    main_media: {
      type: "image",
      url: "/images/home-v27/sweet-pea-garden-house.webp",
      alt: "Khu vườn và lối vào Sweet Pea",
    },
    top_media: {
      type: "image",
      url: "/images/home-v27/sweet-pea-garden-view.webp",
      alt: "Góc nhìn từ bàn ngồi ra sân vườn",
    },
    bottom_media: {
      type: "image",
      url: "/images/home-v27/sweet-pea-pastry-case.webp",
      alt: "Tủ bánh Sweet Pea",
    },
    main_label: "Góc vườn xanh",
    top_label: "Ngồi thật chậm",
    bottom_label: "Bánh mới mỗi ngày",
  },
};

function media(value: unknown, fallback: HomeMedia): HomeMedia {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Partial<HomeMedia>;
  const type = record.type === "video" || record.type === "gif" ? record.type : "image";
  return {
    type,
    url: typeof record.url === "string" && record.url.trim() ? record.url.trim() : fallback.url,
    alt: typeof record.alt === "string" ? record.alt.trim() : fallback.alt,
  };
}

function tuple3(value: unknown, fallback: [string, string, string]): [string, string, string] {
  if (!Array.isArray(value)) return fallback;
  return [0, 1, 2].map((index) => {
    const candidate = value[index];
    return typeof candidate === "string" && candidate.trim() ? candidate.trim() : fallback[index];
  }) as [string, string, string];
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function normalizeHomePageContent(value: unknown): HomePageContent {
  if (!value || typeof value !== "object") return DEFAULT_HOME_PAGE_CONTENT;
  const root = value as Record<string, unknown>;
  const hero = root.hero && typeof root.hero === "object" ? (root.hero as Record<string, unknown>) : {};
  const space = root.space && typeof root.space === "object" ? (root.space as Record<string, unknown>) : {};
  const fallbackHero = DEFAULT_HOME_PAGE_CONTENT.hero;
  const fallbackSpace = DEFAULT_HOME_PAGE_CONTENT.space;

  return {
    hero: {
      eyebrow: text(hero.eyebrow, fallbackHero.eyebrow),
      title: text(hero.title, fallbackHero.title),
      accent_title: text(hero.accent_title, fallbackHero.accent_title),
      description: text(hero.description, fallbackHero.description),
      primary_label: text(hero.primary_label, fallbackHero.primary_label),
      primary_href: text(hero.primary_href, fallbackHero.primary_href),
      secondary_label: text(hero.secondary_label, fallbackHero.secondary_label),
      secondary_href: text(hero.secondary_href, fallbackHero.secondary_href),
      chips: tuple3(hero.chips, fallbackHero.chips),
      main_media: media(hero.main_media, fallbackHero.main_media),
      bubble_media: media(hero.bubble_media, fallbackHero.bubble_media),
      media_label: text(hero.media_label, fallbackHero.media_label),
      sticker_title: text(hero.sticker_title, fallbackHero.sticker_title),
      sticker_text: text(hero.sticker_text, fallbackHero.sticker_text),
    },
    space: {
      eyebrow: text(space.eyebrow, fallbackSpace.eyebrow),
      title: text(space.title, fallbackSpace.title),
      description: text(space.description, fallbackSpace.description),
      chips: tuple3(space.chips, fallbackSpace.chips),
      cta_label: text(space.cta_label, fallbackSpace.cta_label),
      cta_href: text(space.cta_href, fallbackSpace.cta_href),
      main_media: media(space.main_media, fallbackSpace.main_media),
      top_media: media(space.top_media, fallbackSpace.top_media),
      bottom_media: media(space.bottom_media, fallbackSpace.bottom_media),
      main_label: text(space.main_label, fallbackSpace.main_label),
      top_label: text(space.top_label, fallbackSpace.top_label),
      bottom_label: text(space.bottom_label, fallbackSpace.bottom_label),
    },
  };
}
