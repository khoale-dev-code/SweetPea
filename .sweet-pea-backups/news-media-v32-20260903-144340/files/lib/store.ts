import "server-only";

import { defaultCategories, defaultItems, defaultNews, defaultShop } from "./default-data";
import type { MenuCategory, MenuItem, NewsPost, ShopSettings, StoreData } from "./types";

const MENU_TAG = "sweet-pea-menu";
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
    next: options.tags ? { revalidate: 60, tags: options.tags } : undefined,
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

function asNewsPost(item: MenuItem): NewsPost {
  const content = item.description || "";
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
  return {
    ...(categoryId ? { category_id: categoryId } : {}),
    name: data.title,
    description: data.content,
    price: 0,
    image_url: data.image_url,
    is_featured: data.is_featured,
    is_available: data.is_published,
    sort_order: data.sort_order,
  };
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

export { MENU_TAG };
