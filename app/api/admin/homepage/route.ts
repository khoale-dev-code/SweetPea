import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAdminHomePageContent, HOMEPAGE_TAG, updateHomePageContent } from "@/lib/homepage";

export const runtime = "nodejs";
export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const mediaUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(4096)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Media URL khong hop le.");

const hrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(4096)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Lien ket khong hop le.");

const mediaSchema = z.object({
  type: z.enum(["image", "gif", "video"]),
  url: mediaUrlSchema,
  alt: z.string().trim().max(220).default(""),
});

const contentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(180),
    accent_title: z.string().trim().min(1).max(180),
    description: z.string().trim().min(1).max(700),
    primary_label: z.string().trim().min(1).max(80),
    primary_href: hrefSchema,
    secondary_label: z.string().trim().min(1).max(80),
    secondary_href: hrefSchema,
    chips: z.tuple([
      z.string().trim().min(1).max(90),
      z.string().trim().min(1).max(90),
      z.string().trim().min(1).max(90),
    ]),
    main_media: mediaSchema,
    bubble_media: mediaSchema,
    media_label: z.string().trim().min(1).max(120),
    sticker_title: z.string().trim().min(1).max(100),
    sticker_text: z.string().trim().min(1).max(160),
  }),
  space: z.object({
    eyebrow: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(220),
    description: z.string().trim().min(1).max(700),
    chips: z.tuple([
      z.string().trim().min(1).max(90),
      z.string().trim().min(1).max(90),
      z.string().trim().min(1).max(90),
    ]),
    cta_label: z.string().trim().min(1).max(80),
    cta_href: hrefSchema,
    main_media: mediaSchema,
    top_media: mediaSchema,
    bottom_media: mediaSchema,
    main_label: z.string().trim().min(1).max(120),
    top_label: z.string().trim().min(1).max(120),
    bottom_label: z.string().trim().min(1).max(120),
  }),
});

async function authorized() {
  if (await isAdminRequest()) return null;
  return NextResponse.json({ error: "Phien quan tri da het han." }, { status: 401 });
}

export async function GET() {
  const rejected = await authorized();
  if (rejected) return rejected;

  try {
    const content = await getAdminHomePageContent();
    return NextResponse.json({ content }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Khong the tai noi dung trang chu." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const rejected = await authorized();
  if (rejected) return rejected;

  try {
    const body = await request.json().catch(() => ({}));
    const content = contentSchema.parse(body.content);
    const saved = await updateHomePageContent(content);
    revalidateTag(HOMEPAGE_TAG, "max");
    revalidatePath("/");
    return NextResponse.json({ ok: true, content: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Du lieu trang chu khong hop le." },
      { status: 400 },
    );
  }
}
