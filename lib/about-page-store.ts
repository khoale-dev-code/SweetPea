import "server-only";

import {
  DEFAULT_ABOUT_PAGE_CONTENT,
  normalizeAboutPageContent,
  type AboutPageContent,
} from "@/lib/about-page-types";

export const ABOUT_PAGE_TAG = "sweet-pea-about-page";

function supabaseBase() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
}

function publicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

function adminKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

async function request<T>(path: string, options?: { admin?: boolean; method?: string; body?: unknown }) {
  const base = supabaseBase();
  const key = options?.admin ? adminKey() : publicKey();

  if (!base || !key) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${base}/rest/v1/${path}`, {
    method: options?.method || "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options?.method === "POST"
        ? { Prefer: "resolution=merge-duplicates,return=representation" }
        : {}),
    },
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options?.admin ? "no-store" : "force-cache",
    ...(options?.admin
      ? {}
      : {
          next: {
            revalidate: 300,
            tags: [ABOUT_PAGE_TAG],
          },
        }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Supabase request failed (${response.status}).`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  if (!supabaseBase() || !publicKey()) return DEFAULT_ABOUT_PAGE_CONTENT;

  try {
    const rows = await request<Array<{ content: unknown }>>(
      "about_page_content?select=content&id=eq.1&limit=1",
    );
    return normalizeAboutPageContent(rows[0]?.content);
  } catch (error) {
    console.error(
      "About page public query failed; using local defaults.",
      error instanceof Error ? error.message : error,
    );
    return DEFAULT_ABOUT_PAGE_CONTENT;
  }
}

export async function getAdminAboutPageContent(): Promise<AboutPageContent> {
  const rows = await request<Array<{ content: unknown }>>(
    "about_page_content?select=content&id=eq.1&limit=1",
    { admin: true },
  );
  return normalizeAboutPageContent(rows[0]?.content);
}

export async function saveAboutPageContent(content: unknown): Promise<AboutPageContent> {
  const normalized = normalizeAboutPageContent(content);
  const rows = await request<Array<{ content: unknown }>>(
    "about_page_content?on_conflict=id",
    {
      admin: true,
      method: "POST",
      body: {
        id: 1,
        content: normalized,
        updated_at: new Date().toISOString(),
      },
    },
  );
  return normalizeAboutPageContent(rows?.[0]?.content || normalized);
}
