import "server-only";

import { DEFAULT_HOME_PAGE_CONTENT, normalizeHomePageContent } from "./homepage-defaults";
import type { HomePageContent } from "./homepage-types";

export const HOMEPAGE_TAG = "sweet-pea-homepage";
const REVALIDATE_SECONDS = 60;

type SupabaseRow = {
  id: number;
  content: unknown;
};

function publicConfig() {
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}

function adminConfig() {
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

async function request<T>(
  path: string,
  options: {
    admin?: boolean;
    method?: "GET" | "PATCH";
    body?: unknown;
    cache?: RequestCache;
    tagged?: boolean;
  } = {},
): Promise<T> {
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
    next: options.tagged
      ? { revalidate: REVALIDATE_SECONDS, tags: [HOMEPAGE_TAG] }
      : undefined,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Homepage Supabase request failed (${response.status}): ${detail.slice(0, 260)}`);
  }

  return (await response.json()) as T;
}

export async function getHomePageContent(): Promise<HomePageContent> {
  const { url, key } = publicConfig();
  if (!url || !key) return DEFAULT_HOME_PAGE_CONTENT;

  try {
    const rows = await request<SupabaseRow[]>(
      "homepage_content?select=id,content&id=eq.1&limit=1",
      { tagged: true },
    );
    return normalizeHomePageContent(rows[0]?.content);
  } catch (error) {
    console.error(
      "Homepage content query failed; serving defaults.",
      error instanceof Error ? error.message : error,
    );
    return DEFAULT_HOME_PAGE_CONTENT;
  }
}

export async function getAdminHomePageContent(): Promise<HomePageContent> {
  const rows = await request<SupabaseRow[]>(
    "homepage_content?select=id,content&id=eq.1&limit=1",
    { admin: true, cache: "no-store" },
  );
  return normalizeHomePageContent(rows[0]?.content);
}

export async function updateHomePageContent(content: HomePageContent): Promise<HomePageContent> {
  const rows = await request<SupabaseRow[]>(
    "homepage_content?id=eq.1",
    {
      admin: true,
      method: "PATCH",
      body: { content },
      cache: "no-store",
    },
  );

  if (!rows[0]) throw new Error("Homepage content row was not found. Run the homepage SQL migration first.");
  return normalizeHomePageContent(rows[0].content);
}
