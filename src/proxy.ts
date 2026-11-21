import { NextResponse, type NextRequest } from "next/server";

const NAMA_COOKIE_SESI = "sesi_kasir";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const punyaSesi = Boolean(request.cookies.get(NAMA_COOKIE_SESI)?.value);

  if (pathname.startsWith("/kasir") && !punyaSesi) {
    const url = new URL("/login", request.url);
    url.searchParams.set("dari", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && punyaSesi) {
    return NextResponse.redirect(new URL("/kasir", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kasir/:path*", "/login"],
};
