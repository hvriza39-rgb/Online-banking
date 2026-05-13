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

  // ✅ ALWAYS allow API routes (CRITICAL FIX)
  if (isApiRoute && !isPublicApi) {
    return NextResponse.next();
  }

  // Allow NextAuth internal routes
  if (isPublicApi) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", nextUrl)
    );
  }

  // Redirect unauthenticated users only for pages (NOT API)
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Protect admin pages
  if (isAdminPage && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});
