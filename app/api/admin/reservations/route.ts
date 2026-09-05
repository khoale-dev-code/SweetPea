import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  getTableReservations,
  updateTableReservationStatus,
} from "@/lib/store";

export const runtime = "nodejs";
export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

async function unauthorized() {
  if (await isAdminRequest()) return null;
  return NextResponse.json(
    { error: "Phiên quản trị đã hết hạn." },
    { status: 401 },
  );
}

export async function GET() {
  const rejected = await unauthorized();
  if (rejected) return rejected;

  try {
    const reservations = await getTableReservations(250);
    return NextResponse.json(
      { reservations },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Reservation admin load failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Không thể tải danh sách đặt bàn." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const rejected = await unauthorized();
  if (rejected) return rejected;

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Yêu cầu cập nhật không hợp lệ." },
        { status: 400 },
      );
    }

    const reservation = await updateTableReservationStatus(
      parsed.data.id,
      parsed.data.status,
    );

    return NextResponse.json({ ok: true, reservation });
  } catch (error) {
    console.error(
      "Reservation admin update failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Không thể cập nhật yêu cầu đặt bàn." },
      { status: 500 },
    );
  }
}
