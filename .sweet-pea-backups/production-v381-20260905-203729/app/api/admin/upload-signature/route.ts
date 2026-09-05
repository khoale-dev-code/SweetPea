import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const preferredRegion = "sin1";

export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Phiên quản trị đã hết hạn." }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  const folder = process.env.CLOUDINARY_FOLDER || "Sweet Pea";
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary chưa được cấu hình." }, { status: 503 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({ cloudName, apiKey, folder, timestamp, signature });
}
