import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sweet_pea_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_API_KEY || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(`sweet-pea:${payload}`).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyAdminKey(candidate: string) {
  const configured = secret();
  if (!configured || !candidate) return false;
  return safeEqual(sign(candidate), sign(configured));
}

export function createAdminToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ expiresAt, role: "owner" })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string) {
  if (!secret() || !token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return false;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { expiresAt?: number };
    return Number(value.expiresAt) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function isAdminRequest() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};
