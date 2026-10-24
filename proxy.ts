import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

// HTTP Basic Auth in front of the /stats dashboard. Any username works; the
// password is STATS_PASSWORD. Without it set, /stats doesn't exist.

const digest = (s: string) => createHash("sha256").update(s).digest();

function authorized(header: string | null, password: string): boolean {
  if (!header?.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const given = decoded.slice(decoded.indexOf(":") + 1);
  // Hash both sides so the comparison is constant-time regardless of length
  return timingSafeEqual(digest(given), digest(password));
}

export function proxy(req: NextRequest) {
  const password = process.env.STATS_PASSWORD;
  if (!password) return new NextResponse("Not found", { status: 404 });
  if (authorized(req.headers.get("authorization"), password)) return NextResponse.next();
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="stats", charset="UTF-8"' },
  });
}

export const config = {
  matcher: "/stats",
};
