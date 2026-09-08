export type HomeMediaType = "image" | "gif" | "video";

export type HomeMedia = {
  type: HomeMediaType;
  url: string;
  alt: string;
};

export type HomeHeroContent = {
  eyebrow: string;
  title: string;
  accent_title: string;
  description: string;
  primary_label: string;
  primary_href: string;
  secondary_label: string;
  secondary_href: string;
  chips: [string, string, string];
  main_media: HomeMedia;
  bubble_media: HomeMedia;
  media_label: string;
  sticker_title: string;
  sticker_text: string;
};

export type HomeSpaceContent = {
  eyebrow: string;
  title: string;
  description: string;
  chips: [string, string, string];
  cta_label: string;
  cta_href: string;
  main_media: HomeMedia;
  top_media: HomeMedia;
  bottom_media: HomeMedia;
  main_label: string;
  top_label: string;
  bottom_label: string;
};

export type HomePageContent = {
  hero: HomeHeroContent;
  space: HomeSpaceContent;
};
