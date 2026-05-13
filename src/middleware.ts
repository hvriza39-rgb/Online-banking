import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isAdmin    = session?.user?.role === "ADMIN";

  const isAuthPage  = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isApiAuth   = nextUrl.pathname.startsWith("/api/auth");

  // Allow auth API routes always
  if (isApiAuth) return NextResponse.next();

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Block non-admins from admin pages
  if (isAdminPage && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
