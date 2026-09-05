import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { createEntity, deleteEntity, getAdminStoreData, MENU_TAG, updateEntity } from "@/lib/store";

export const runtime = "nodejs";
export const preferredRegion = "sin1";

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

function refreshPublicPages() {
  revalidateTag(MENU_TAG, "max");
  revalidatePath("/");
}

async function authorized() {
  if (await isAdminRequest()) return null;
  return NextResponse.json({ error: "Phiên quản trị đã hết hạn." }, { status: 401 });
}

export async function GET() {
  const rejected = await authorized();
  if (rejected) return rejected;

  const startedAt = performance.now();
  try {
    const data = await getAdminStoreData();
    return NextResponse.json({ ...data, latencyMs: Math.round(performance.now() - startedAt) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể tải dữ liệu." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const rejected = await authorized();
  if (rejected) return rejected;

  try {
    const body = (await request.json()) as { entity?: "item" | "category"; data?: unknown };
    if (body.entity !== "item" && body.entity !== "category") throw new Error("Loại dữ liệu không hợp lệ.");
    const data = body.entity === "item" ? itemSchema.parse(body.data) : categorySchema.parse(body.data);
    const result = await createEntity(body.entity, data);
    refreshPublicPages();
    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const rejected = await authorized();
  if (rejected) return rejected;

  try {
    const body = (await request.json()) as { entity?: "item" | "category" | "shop"; id?: string; data?: unknown };
    if (!body.id || !body.entity) throw new Error("Thiếu mã dữ liệu.");
    const data = body.entity === "item" ? itemSchema.parse(body.data) : body.entity === "category" ? categorySchema.parse(body.data) : shopSchema.parse(body.data);
    const result = await updateEntity(body.entity, body.id, data);
    refreshPublicPages();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const rejected = await authorized();
  if (rejected) return rejected;

  try {
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity");
    const id = url.searchParams.get("id");
    if ((entity !== "item" && entity !== "category") || !id) throw new Error("Yêu cầu xóa không hợp lệ.");
    await deleteEntity(entity, id);
    refreshPublicPages();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể xóa dữ liệu." }, { status: 400 });
  }
}
