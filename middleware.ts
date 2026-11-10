import { NextResponse, type NextRequest } from "next/server";

/** Basic auth for /admin. With no ADMIN_PASSWORD set, /admin does not exist (404). */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return new NextResponse("Not found", { status: 404 });
  const header = req.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const [, pass] = atob(encoded).split(":");
    if (pass && pass.length === password.length) {
      let diff = 0;
      for (let i = 0; i < pass.length; i++) diff |= pass.charCodeAt(i) ^ password.charCodeAt(i);
      if (diff === 0) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Veerly admin", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/admin/:path*"] };
