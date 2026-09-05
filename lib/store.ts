import "server-only";

import { defaultCategories, defaultItems, defaultNews, defaultShop } from "./default-data";
import type { MenuCategory, MenuItem, NewsMedia, NewsPost, ShopSettings, StoreData } from "./types";

import type { TableReservation, TableReservationStatus } from "./types";

const MENU_TAG = "sweet-pea-menu";
const PUBLIC_DATA_REVALIDATE_SECONDS = 300;
export const NEWS_CATEGORY_SLUG = "ban-tin";

type SupabaseOptions = {
  admin?: boolean;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  cache?: RequestCache;
  tags?: string[];
};

function publicConfig() {
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}

function adminConfig() {
  const { url } = publicConfig();
  return { url, key: process.env.SUPABASE_SERVICE_ROLE_KEY || "" };
}

async function supabaseRequest<T>(path: string, options: SupabaseOptions = {}): Promise<T> {
  const config = options.admin ? adminConfig() : publicConfig();
  if (!config.url || !config.key) {
    throw new Error(options.admin ? "Supabase server config is missing." : "Supabase public config is missing.");
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options.cache,
    next: options.tags ? { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: options.tags } : undefined,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail.slice(0, 240)}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function normalizeItem(item: MenuItem): MenuItem {
  return {
    ...item,
    price: Number(item.price || 0),
    sort_order: Number(item.sort_order || 0),
    image_url: item.image_url || "",
  };
}

function sampleData(): StoreData {
  return {
    shop: defaultShop,
    categories: defaultCategories,
    items: defaultItems,
    source: "sample",
  };
}

export async function getShopSettings(): Promise<ShopSettings> {
  const { url, key } = publicConfig();
  if (!url || !key) return defaultShop;

  try {
    const shops = await supabaseRequest<ShopSettings[]>(
      "shop_settings?select=id,name,tagline,description,phone,email,address,map_url,zalo_url,opening_text&id=eq.1&limit=1",
      { tags: [MENU_TAG] },
    );
    return shops[0] || defaultShop;
  } catch (error) {
    console.error(
      "Public shop query failed; serving safe sample shop.",
      error instanceof Error ? error.message : error,
    );
    return defaultShop;
  }
}
export async function getStoreData(): Promise<StoreData> {
  const { url, key } = publicConfig();
  if (!url || !key) return sampleData();

  try {
    const [shops, categories, items] = await Promise.all([
      supabaseRequest<ShopSettings[]>(
        "shop_settings?select=id,name,tagline,description,phone,email,address,map_url,zalo_url,opening_text&id=eq.1&limit=1",
        { tags: [MENU_TAG] },
      ),
      supabaseRequest<MenuCategory[]>(
        "menu_categories?select=id,name,slug,description,sort_order,is_visible&is_visible=eq.true&order=sort_order.asc",
        { tags: [MENU_TAG] },
      ),
      supabaseRequest<MenuItem[]>(
        "menu_items?select=id,category_id,name,description,price,image_url,is_featured,is_available,sort_order,created_at&is_available=eq.true&order=sort_order.asc",
        { tags: [MENU_TAG] },
      ),
    ]);

    const newsCategoryIds = new Set(
      categories.filter((category) => category.slug === NEWS_CATEGORY_SLUG).map((category) => category.id),
    );

    return {
      shop: shops[0] || defaultShop,
      categories: categories.filter((category) => category.slug !== NEWS_CATEGORY_SLUG),
      items: items.map(normalizeItem).filter((item) => !newsCategoryIds.has(item.category_id)),
      source: "supabase",
    };
  } catch (error) {
    console.error("Public store query failed; serving safe sample data.", error instanceof Error ? error.message : error);
    return sampleData();
  }
}

export async function getAdminStoreData(): Promise<StoreData> {
  const [shops, categories, items] = await Promise.all([
    supabaseRequest<ShopSettings[]>("shop_settings?select=*&id=eq.1&limit=1", { admin: true, cache: "no-store" }),
    supabaseRequest<MenuCategory[]>("menu_categories?select=*&order=sort_order.asc", { admin: true, cache: "no-store" }),
    supabaseRequest<MenuItem[]>("menu_items?select=*&order=sort_order.asc", { admin: true, cache: "no-store" }),
  ]);

  return {
    shop: shops[0] || defaultShop,
    categories,
    items: items.map(normalizeItem),
    source: "supabase",
  };
}

const NEWS_MEDIA_MARKER = /\[\[newsmedia:([^\]]*)\]\]/i;
const NEWS_AUTOPLAY_MARKER = /\[\[newsautoplay:(\d+)\]\]/i;

function cleanNewsContent(value?: string) {
  return (value || "")
    .replace(NEWS_MEDIA_MARKER, "")
    .replace(NEWS_AUTOPLAY_MARKER, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inferNewsMediaType(url: string): NewsMedia["type"] {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".gif")) return "gif";
  if (/\.(mp4|webm|mov|m4v|ogv|ogg)$/i.test(clean)) return "video";
  return "image";
}

function parseNewsMedia(value: string, imageUrl = "") {
  const match = value.match(NEWS_MEDIA_MARKER);
  const media: NewsMedia[] = [];

  if (match?.[1]) {
    for (const part of match[1].split("|").map((entry) => entry.trim()).filter(Boolean)) {
      const separator = part.indexOf("=");
      if (separator <= 0) continue;
      const rawType = part.slice(0, separator).trim().toLowerCase();
      const encodedUrl = part.slice(separator + 1).trim();
      let url = encodedUrl;
      try { url = decodeURIComponent(encodedUrl); } catch { /* keep original URL */ }
      if (!url) continue;
      const type: NewsMedia["type"] = rawType === "video" ? "video" : rawType === "gif" ? "gif" : "image";
      if (!media.some((item) => item.url === url)) media.push({ type, url });
    }
  }

  if (imageUrl && !media.some((item) => item.url === imageUrl)) {
    media.unshift({ type: inferNewsMediaType(imageUrl), url: imageUrl });
  }

  const autoplayMatch = value.match(NEWS_AUTOPLAY_MARKER);
  const autoplaySeconds = autoplayMatch ? Math.max(0, Math.min(30, Number(autoplayMatch[1]) || 0)) : 0;
  return { media, autoplaySeconds };
}

function serializeNewsContent(content: unknown, rawMedia: unknown, autoplayValue: unknown) {
  const clean = cleanNewsContent(String(content || ""));
  const media = Array.isArray(rawMedia)
    ? rawMedia
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const record = item as Record<string, unknown>;
          const url = String(record.url || "").trim();
          if (!url) return null;
          const rawType = String(record.type || inferNewsMediaType(url)).toLowerCase();
          const type: NewsMedia["type"] = rawType === "video" ? "video" : rawType === "gif" ? "gif" : "image";
          return { type, url };
        })
        .filter((item): item is NewsMedia => Boolean(item))
        .filter((item, index, list) => list.findIndex((candidate) => candidate.url === item.url) === index)
        .slice(0, 12)
    : [];

  const chunks = [clean];
  if (media.length) {
    chunks.push(`[[newsmedia:${media.map((item) => `${item.type}=${encodeURIComponent(item.url)}`).join("|")}]]`);
  }
  const autoplaySeconds = Math.max(0, Math.min(30, Number(autoplayValue || 0)));
  if (autoplaySeconds > 0 && media.length > 1) chunks.push(`[[newsautoplay:${autoplaySeconds}]]`);
  return chunks.filter(Boolean).join("\n\n");
}

function asNewsPost(item: MenuItem): NewsPost {
  const rawContent = item.description || "";
  const content = cleanNewsContent(rawContent);
  const { media, autoplaySeconds } = parseNewsMedia(rawContent, item.image_url || "");
  return {
    id: item.id,
    title: item.name,
    excerpt: content.length > 165 ? `${content.slice(0, 162).trim()}…` : content,
    content,
    image_url: item.image_url || "",
    is_featured: Boolean(item.is_featured),
    is_published: Boolean(item.is_available),
    sort_order: Number(item.sort_order || 0),
    published_at: item.created_at || new Date().toISOString(),
    media,
    media_autoplay_seconds: autoplaySeconds,
  };
}

export async function getNewsPosts(): Promise<NewsPost[]> {
  const { url, key } = publicConfig();
  if (!url || !key) return defaultNews;

  try {
    const items = await supabaseRequest<(MenuItem & { menu_categories: { slug: string } })[]>(
      `menu_items?select=id,category_id,name,description,price,image_url,is_featured,is_available,sort_order,created_at,menu_categories!inner(slug)&menu_categories.slug=eq.${NEWS_CATEGORY_SLUG}&is_available=eq.true&order=sort_order.asc`,
      { tags: [MENU_TAG] },
    );
    return items.length ? items.map(normalizeItem).map(asNewsPost) : defaultNews;
  } catch (error) {
    console.error("News query failed; serving sample news.", error instanceof Error ? error.message : error);
    return defaultNews;
  }
}

async function ensureNewsCategory() {
  const categories = await supabaseRequest<MenuCategory[]>(
    `menu_categories?select=*&slug=eq.${NEWS_CATEGORY_SLUG}&limit=1`,
    { admin: true, cache: "no-store" },
  );
  if (categories[0]) return categories[0];

  const rows = await supabaseRequest<MenuCategory[]>("menu_categories", {
    admin: true,
    method: "POST",
    body: {
      name: "Bản tin",
      slug: NEWS_CATEGORY_SLUG,
      description: "Danh mục hệ thống dùng cho các bài viết Sweet Pea.",
      sort_order: 999,
      is_visible: true,
    },
    cache: "no-store",
  });
  return rows[0];
}

function newsPayload(data: Record<string, unknown>, categoryId?: string) {
  const payload: Record<string, unknown> = { ...(categoryId ? { category_id: categoryId } : {}) };
  if ("title" in data) payload.name = data.title;
  if ("content" in data || "media" in data || "media_autoplay_seconds" in data) {
    payload.description = serializeNewsContent(data.content, data.media, data.media_autoplay_seconds);
  }
  if ("image_url" in data) payload.image_url = data.image_url;
  if ("is_featured" in data) payload.is_featured = data.is_featured;
  if ("is_published" in data) payload.is_available = data.is_published;
  if ("sort_order" in data) payload.sort_order = data.sort_order;
  if (categoryId) payload.price = 0;
  return payload;
}

export async function createNewsPost(data: Record<string, unknown>) {
  const category = await ensureNewsCategory();
  const rows = await supabaseRequest<unknown[]>("menu_items", {
    admin: true,
    method: "POST",
    body: newsPayload(data, category.id),
    cache: "no-store",
  });
  return rows[0];
}

export async function updateNewsPost(id: string, data: Record<string, unknown>) {
  const rows = await supabaseRequest<unknown[]>(`menu_items?id=eq.${encodeURIComponent(id)}`, {
    admin: true,
    method: "PATCH",
    body: newsPayload(data),
    cache: "no-store",
  });
  return rows[0];
}

export async function deleteNewsPost(id: string) {
  await supabaseRequest(`menu_items?id=eq.${encodeURIComponent(id)}`, {
    admin: true,
    method: "DELETE",
    cache: "no-store",
  });
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createEntity(entity: "item" | "category", data: Record<string, unknown>) {
  const table = entity === "item" ? "menu_items" : "menu_categories";
  const payload = entity === "category" ? { ...data, slug: slugify(String(data.name || "")) } : data;
  const rows = await supabaseRequest<unknown[]>(table, { admin: true, method: "POST", body: payload, cache: "no-store" });
  return rows[0];
}

export async function updateEntity(
  entity: "item" | "category" | "shop",
  id: string,
  data: Record<string, unknown>,
) {
  const table = entity === "item" ? "menu_items" : entity === "category" ? "menu_categories" : "shop_settings";
  const payload = entity === "category" && data.name ? { ...data, slug: slugify(String(data.name)) } : data;
  const rows = await supabaseRequest<unknown[]>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    admin: true,
    method: "PATCH",
    body: payload,
    cache: "no-store",
  });
  return rows[0];
}

export async function deleteEntity(entity: "item" | "category", id: string) {
  const table = entity === "item" ? "menu_items" : "menu_categories";
  await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    admin: true,
    method: "DELETE",
    cache: "no-store",
  });
}

export async function createTableReservation(
  data: Omit<
    TableReservation,
    "id" | "status" | "created_at" | "updated_at"
  >,
): Promise<TableReservation> {
  const rows = await supabaseRequest<TableReservation[]>("table_reservations", {
    admin: true,
    method: "POST",
    body: {
      ...data,
      status: "pending",
    },
    cache: "no-store",
  });

  if (!rows[0]) throw new Error("Reservation was not created.");
  return rows[0];
}

export async function getTableReservations(limit = 250): Promise<TableReservation[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(limit || 250)));

  return supabaseRequest<TableReservation[]>(
    `table_reservations?select=*&order=created_at.desc&limit=${safeLimit}`,
    {
      admin: true,
      cache: "no-store",
    },
  );
}

export async function updateTableReservationStatus(
  id: string,
  status: TableReservationStatus,
): Promise<TableReservation> {
  const rows = await supabaseRequest<TableReservation[]>(
    `table_reservations?id=eq.${encodeURIComponent(id)}`,
    {
      admin: true,
      method: "PATCH",
      body: { status },
      cache: "no-store",
    },
  );

  if (!rows[0]) throw new Error("Reservation was not found.");
  return rows[0];
}
export { MENU_TAG };
