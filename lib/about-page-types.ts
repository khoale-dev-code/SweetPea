export type AboutMediaKind = "image" | "gif" | "video";

export type AboutMedia = {
  type: AboutMediaKind;
  url: string;
  alt: string;
};

export type AboutHighlight = {
  title: string;
  text: string;
};

export type AboutGalleryItem = {
  id: string;
  caption: string;
  media: AboutMedia;
};

export type AboutPageContent = {
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    primary_label: string;
    secondary_label: string;
    badge_title: string;
    badge_text: string;
    media: AboutMedia;
  };
  story: {
    eyebrow: string;
    title: string;
    paragraph_1: string;
    paragraph_2: string;
    paragraph_3: string;
    media_left: AboutMedia;
    media_right: AboutMedia;
  };
  highlights: AboutHighlight[];
  gallery: {
    eyebrow: string;
    title: string;
    description: string;
    items: AboutGalleryItem[];
  };
  quote: {
    text: string;
    description: string;
    media: AboutMedia;
  };
};

export const DEFAULT_ABOUT_PAGE_CONTENT: AboutPageContent = {
  hero: {
    eyebrow: "Về Sweet Pea",
    title: "Một góc vườn nhỏ,",
    accent: "nhiều điều dịu dàng.",
    description:
      "Sweet Pea là một tiệm bánh & café mang tinh thần sân vườn — nơi mùi bánh mới, ly nước mát và những tán cây xanh cùng tạo nên một khoảng dừng nhẹ nhàng cho mỗi cuộc hẹn.",
    primary_label: "Khám phá không gian",
    secondary_label: "Xem menu",
    badge_title: "Sân vườn",
    badge_text: "Một khoảng xanh để ngồi thật lâu.",
    media: {
      type: "image",
      url: "/images/about/sweet-pea-lemon-garden.webp",
      alt: "Không gian sân vườn Sweet Pea với cây xanh và khu trưng bày trái vàng",
    },
  },
  story: {
    eyebrow: "Câu chuyện của Sweet Pea",
    title: "Nơi những ngày bình thường cũng có thể trở nên đáng nhớ.",
    paragraph_1:
      "Sweet Pea lớn lên từ tình yêu dành cho những khu vườn, những chiếc bánh vừa ra lò và cảm giác dễ chịu của một buổi chiều không cần vội.",
    paragraph_2:
      "Tiệm không cố gắng trở thành một nơi quá cầu kỳ. Chúng mình chỉ muốn mỗi góc ngồi, từng chiếc bánh và từng ly nước đều đủ chỉn chu để bạn cảm thấy thoải mái khi ghé qua.",
    paragraph_3:
      "Dù là một buổi hẹn, một buổi làm việc hay vài phút dành riêng cho mình, Sweet Pea luôn mong bạn tìm thấy một khoảng thật nhẹ ở đây.",
    media_left: {
      type: "image",
      url: "/images/about/sweet-pea-garden-house.webp",
      alt: "Lối vào xanh mát của Sweet Pea",
    },
    media_right: {
      type: "image",
      url: "/images/about/sweet-pea-plaid-table.webp",
      alt: "Bàn ghế ngoài trời tại Sweet Pea",
    },
  },
  highlights: [
    {
      title: "Không gian sân vườn",
      text: "Nhiều cây xanh, khoảng thở và ánh sáng tự nhiên để bạn chậm lại một chút giữa ngày.",
    },
    {
      title: "Bánh & nước làm mỗi ngày",
      text: "Từng món được chuẩn bị theo nhịp nhỏ, ưu tiên sự tươi mới, vừa vị và cảm giác thân thuộc.",
    },
    {
      title: "Góc ngồi ấm cúng",
      text: "Có những góc riêng tư cho buổi hẹn, làm việc nhẹ nhàng hoặc đơn giản là ngồi yên một lúc.",
    },
  ],
  gallery: {
    eyebrow: "Một vòng quanh tiệm",
    title: "Không gian tại Sweet Pea",
    description:
      "Từ hiên nhỏ, khu vườn đến tủ bánh — mỗi góc đều giữ một chút chất mộc và sự gần gũi riêng.",
    items: [
      {
        id: "garden-main",
        caption: "Góc vườn xanh",
        media: {
          type: "image",
          url: "/images/about/sweet-pea-lemon-garden.webp",
          alt: "Góc sân vườn Sweet Pea dưới tán cây và những giỏ trái vàng",
        },
      },
      {
        id: "garden-house",
        caption: "Lối nhỏ vào tiệm",
        media: {
          type: "image",
          url: "/images/about/sweet-pea-garden-house.webp",
          alt: "Lối nhỏ xanh mát dẫn vào không gian Sweet Pea",
        },
      },
      {
        id: "garden-view",
        caption: "Ngồi thật chậm",
        media: {
          type: "image",
          url: "/images/about/sweet-pea-garden-view.webp",
          alt: "Từ hiên Sweet Pea nhìn ra khu vườn và bàn ghế ngoài trời",
        },
      },
      {
        id: "plaid-table",
        caption: "Một chiếc bàn nhỏ",
        media: {
          type: "image",
          url: "/images/about/sweet-pea-plaid-table.webp",
          alt: "Bàn ghế gỗ và hoa trong khu sân vườn Sweet Pea",
        },
      },
      {
        id: "pastry-case",
        caption: "Bánh mới mỗi ngày",
        media: {
          type: "image",
          url: "/images/about/sweet-pea-pastry-case.webp",
          alt: "Tủ bánh với các món bánh nướng tại Sweet Pea",
        },
      },
    ],
  },
  quote: {
    text: "Nơi những buổi hẹn trở nên nhẹ nhàng hơn.",
    description: "Một chiếc bàn nhỏ, một món mình thích và đủ thời gian để chuyện trò.",
    media: {
      type: "image",
      url: "/images/about/sweet-pea-garden-view.webp",
      alt: "Không gian nhìn ra khu vườn Sweet Pea",
    },
  },
};

function media(value: unknown, fallback: AboutMedia): AboutMedia {
  const row = value && typeof value === "object" ? (value as Partial<AboutMedia>) : {};
  const type = row.type === "video" || row.type === "gif" ? row.type : row.type === "image" ? "image" : fallback.type;
  return {
    type,
    url: typeof row.url === "string" && row.url.trim() ? row.url.trim() : fallback.url,
    alt: typeof row.alt === "string" ? row.alt : fallback.alt,
  };
}

export function normalizeAboutPageContent(value: unknown): AboutPageContent {
  const raw = value && typeof value === "object" ? (value as Partial<AboutPageContent>) : {};
  const hero = (raw.hero || {}) as Partial<AboutPageContent["hero"]>;
  const story = (raw.story || {}) as Partial<AboutPageContent["story"]>;
  const gallery = (raw.gallery || {}) as Partial<AboutPageContent["gallery"]>;
  const quote = (raw.quote || {}) as Partial<AboutPageContent["quote"]>;

  const highlights = Array.isArray(raw.highlights) && raw.highlights.length
    ? raw.highlights.slice(0, 3).map((item, index) => ({
        title: typeof item?.title === "string" ? item.title : DEFAULT_ABOUT_PAGE_CONTENT.highlights[index]?.title || "Sweet Pea",
        text: typeof item?.text === "string" ? item.text : DEFAULT_ABOUT_PAGE_CONTENT.highlights[index]?.text || "",
      }))
    : [...DEFAULT_ABOUT_PAGE_CONTENT.highlights];

  while (highlights.length < 3) {
    highlights.push(DEFAULT_ABOUT_PAGE_CONTENT.highlights[highlights.length]);
  }

  const rawItems = Array.isArray(gallery.items) && gallery.items.length
    ? gallery.items.slice(0, 8)
    : DEFAULT_ABOUT_PAGE_CONTENT.gallery.items;

  const galleryItems = rawItems.map((item, index) => {
    const fallback = DEFAULT_ABOUT_PAGE_CONTENT.gallery.items[index % DEFAULT_ABOUT_PAGE_CONTENT.gallery.items.length];
    return {
      id: typeof item?.id === "string" && item.id ? item.id : `about-media-${index + 1}`,
      caption: typeof item?.caption === "string" ? item.caption : fallback.caption,
      media: media(item?.media, fallback.media),
    };
  });

  return {
    hero: {
      ...DEFAULT_ABOUT_PAGE_CONTENT.hero,
      ...hero,
      media: media(hero.media, DEFAULT_ABOUT_PAGE_CONTENT.hero.media),
    },
    story: {
      ...DEFAULT_ABOUT_PAGE_CONTENT.story,
      ...story,
      media_left: media(story.media_left, DEFAULT_ABOUT_PAGE_CONTENT.story.media_left),
      media_right: media(story.media_right, DEFAULT_ABOUT_PAGE_CONTENT.story.media_right),
    },
    highlights,
    gallery: {
      ...DEFAULT_ABOUT_PAGE_CONTENT.gallery,
      ...gallery,
      items: galleryItems,
    },
    quote: {
      ...DEFAULT_ABOUT_PAGE_CONTENT.quote,
      ...quote,
      media: media(quote.media, DEFAULT_ABOUT_PAGE_CONTENT.quote.media),
    },
  };
}
