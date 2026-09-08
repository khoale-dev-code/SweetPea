import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  ABOUT_PAGE_TAG,
  getAdminAboutPageContent,
  saveAboutPageContent,
} from "@/lib/about-page-store";
import { DEFAULT_ABOUT_PAGE_CONTENT } from "@/lib/about-page-types";

export const runtime = "nodejs";
export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function guard() {
  if (await isAdminRequest()) return null;
  return NextResponse.json(
    { error: "Phiên quản trị đã hết hạn." },
    { status: 401 },
  );
}

export async function GET() {
  const rejected = await guard();
  if (rejected) return rejected;

  try {
    const content = await getAdminAboutPageContent();
    return NextResponse.json(
      { content, setupRequired: false },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error(
      "About page admin load failed:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      {
        content: DEFAULT_ABOUT_PAGE_CONTENT,
        setupRequired: true,
        warning:
          "Chưa đọc được dữ liệu Giới thiệu. Nếu vừa cài tính năng này, hãy chạy supabase/ABOUT-PAGE-V4.8.sql trong Supabase SQL Editor.",
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }
}

export async function PUT(request: Request) {
  const rejected = await guard();
  if (rejected) return rejected;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      content?: unknown;
    };

    if (!body.content || typeof body.content !== "object") {
      return NextResponse.json(
        { error: "Nội dung trang Giới thiệu không hợp lệ." },
        { status: 400 },
      );
    }

    const content = await saveAboutPageContent(body.content);
    revalidateTag(ABOUT_PAGE_TAG, "max");
    revalidatePath("/about");

    return NextResponse.json({ content });
  } catch (error) {
    console.error(
      "About page save failed:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      {
        error:
          "Không thể lưu trang Giới thiệu. Hãy kiểm tra Supabase và chạy supabase/ABOUT-PAGE-V4.8.sql nếu chưa tạo bảng.",
      },
      { status: 500 },
    );
  }
}
