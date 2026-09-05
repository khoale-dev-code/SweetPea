import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createEntity,
  createNewsPost,
  deleteEntity,
  deleteNewsPost,
  getAdminStoreData,
  MENU_TAG,
  updateEntity,
  updateNewsPost,
} from "@/lib/store";

export const runtime = "nodejs";
export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const itemSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category_id: z.string().min(1),
  description: z.string().trim().max(600).default(""),
  price: z.coerce.number().int().min(0).max(100_000_000),
  image_url: z.string().trim().url().or(z.literal("")),
  is_featured: z.boolean().default(false),
  is_available: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).default(""),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_visible: z.boolean().default(true),
});

const shopSchema = z.object({
  name: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(160),
  description: z.string().trim().max(600),
  phone: z.string().trim().min(8).max(30),
  email: z.string().trim().email(),
  address: z.string().trim().min(5).max(400),
  map_url: z.string().trim().url(),
  zalo_url: z.string().trim().url(),
  opening_text: z.string().trim().max(120),
});

const newsMediaSchema = z.object({
  type: z.enum(["image", "gif", "video"]),
  url: z.string().trim().url().max(4096),
});

// Keep CREATE and PATCH schemas separate. This is important because a quick PATCH
// such as toggling "featured" must not inject default media/content values and
// accidentally overwrite an existing news gallery.
const newsCreateSchema = z.object({
  title: z.string().trim().min(4).max(180),
  content: z.string().trim().min(20).max(12_000),
  image_url: z.string().trim().url().or(z.literal("")),
  media: z.array(newsMediaSchema).max(12).default([]),
  media_autoplay_seconds: z.coerce.number().int().min(0).max(30).default(0),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

const newsUpdateSchema = z
  .object({
    title: z.string().trim().min(4).max(180).optional(),
    content: z.string().trim().min(20).max(12_000).optional(),
    image_url: z.string().trim().url().or(z.literal("")).optional(),
    media: z.array(newsMediaSchema).max(12).optional(),
    media_autoplay_seconds: z.coerce.number().int().min(0).max(30).optional(),
    is_featured: z.boolean().optional(),
    is_published: z.boolean().optional(),
    sort_order: z.coerce.number().int().min(0).max(9999).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Khong co thay doi de luu.",
  });

function refreshPublicPages() {
  revalidateTag(MENU_TAG, "max");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/news");
  revalidatePath("/news/[id]", "page");
}

async function authorized() {
  if (await isAdminRequest()) return null;
  return NextResponse.json({ error: "Phien quan tri da het han." }, { status: 401 });
}

export async function GET() {
  const rejected = await authorized();
  if (rejected) return rejected;

  const startedAt = performance.now();
  try {
    const data = await getAdminStoreData();
    return NextResponse.json(
      { ...data, latencyMs: Math.round(performance.now() - startedAt) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Khong the tai du lieu." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const rejected = await authorized();
  if (rejected) return rejected;

  try {
    const body = (await request.json()) as { entity?: "item" | "category" | "news"; data?: unknown };
    if (body.entity !== "item" && body.entity !== "category" && body.entity !== "news") {
      throw new Error("Loai du lieu khong hop le.");
    }

    const data =
      body.entity === "item"
        ? itemSchema.parse(body.data)
        : body.entity === "category"
          ? categorySchema.parse(body.data)
          : newsCreateSchema.parse(body.data);

    const result = body.entity === "news" ? await createNewsPost(data) : await createEntity(body.entity, data);
    refreshPublicPages();
    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Du lieu khong hop le." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const rejected = await authorized();
  if (rejected) return rejected;

  try {
    const body = (await request.json()) as {
      entity?: "item" | "category" | "shop" | "news";
      id?: string;
      data?: unknown;
    };

    if (!body.id || !body.entity) throw new Error("Thieu ma du lieu.");

    const data =
      body.entity === "item"
        ? itemSchema.parse(body.data)
        : body.entity === "category"
          ? categorySchema.parse(body.data)
          : body.entity === "news"
            ? newsUpdateSchema.parse(body.data)
            : shopSchema.parse(body.data);

    const result = body.entity === "news"
      ? await updateNewsPost(body.id, data)
      : await updateEntity(body.entity, body.id, data);

    refreshPublicPages();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Du lieu khong hop le." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const rejected = await authorized();
  if (rejected) return rejected;

  try {
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity");
    const id = url.searchParams.get("id");

    if ((entity !== "item" && entity !== "category" && entity !== "news") || !id) {
      throw new Error("Yeu cau xoa khong hop le.");
    }

    if (entity === "news") await deleteNewsPost(id);
    else await deleteEntity(entity, id);

    refreshPublicPages();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Khong the xoa du lieu." },
      { status: 400 },
    );
  }
}
