import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  const pathname = nextUrl.pathname;

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isAdminPage = pathname.startsWith("/admin");

  const isApiRoute = pathname.startsWith("/api");

  const isPublicApi = pathname.startsWith("/api/auth");

  if (isApiRoute && !isPublicApi) {
    return NextResponse.next();
  }

  if (isPublicApi) {
    return NextResponse.next();
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", nextUrl)
    );
  }

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminPage && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
