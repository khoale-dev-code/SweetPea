import { NextResponse } from "next/server";
import { getStoreData } from "@/lib/store";

export const preferredRegion = "sin1";

export async function GET() {
  const startedAt = performance.now();
  const data = await getStoreData();
  const duration = Math.max(0, performance.now() - startedAt);

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Server-Timing": `store;dur=${duration.toFixed(1)}`,
    },
  });
}
