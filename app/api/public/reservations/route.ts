import { NextResponse } from "next/server";
import { z } from "zod";
import { createTableReservation } from "@/lib/store";

export const runtime = "nodejs";
export const preferredRegion = "sin1";

const reservationSchema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(24)
    .refine(
      (value) => /^[0-9+().\-\s]{8,24}$/.test(value),
      "Số điện thoại không hợp lệ.",
    ),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reservation_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  guest_count: z.coerce.number().int().min(1).max(30),
  seating_preference: z.enum(["any", "garden", "indoor"]).default("any"),
  note: z.string().trim().max(400).default(""),
  website: z.string().max(0).optional().default(""),
});

function todayInVietnam() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = reservationSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Vui lòng kiểm tra lại thông tin đặt bàn." },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true, reservationCode: "RECEIVED" });
    }

    const today = todayInVietnam();

    if (parsed.data.reservation_date < today) {
      return NextResponse.json(
        { error: "Ngày đặt bàn không thể nằm trong quá khứ." },
        { status: 400 },
      );
    }

    if (parsed.data.reservation_date > addDays(today, 180)) {
      return NextResponse.json(
        { error: "Hiện tại Sweet Pea nhận đặt bàn trước tối đa 180 ngày." },
        { status: 400 },
      );
    }

    const reservation = await createTableReservation({
      customer_name: parsed.data.customer_name,
      phone: parsed.data.phone,
      reservation_date: parsed.data.reservation_date,
      reservation_time: parsed.data.reservation_time,
      guest_count: parsed.data.guest_count,
      seating_preference: parsed.data.seating_preference,
      note: parsed.data.note,
    });

    return NextResponse.json(
      {
        ok: true,
        reservationCode: reservation.id.slice(0, 8).toUpperCase(),
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Reservation create failed:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      {
        error:
          "Chưa thể gửi yêu cầu đặt bàn lúc này. Vui lòng thử lại hoặc liên hệ trực tiếp với tiệm.",
      },
      { status: 500 },
    );
  }
}
