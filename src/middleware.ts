import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname.startsWith("/login");
  const isRegisterRoute = pathname.startsWith("/register");
  const isForgotPasswordRoute = pathname.startsWith("/forgot-password");
  const isHomeRoute = pathname.startsWith("/home");
  const isProfileRoute = pathname.startsWith("/profile");

  if ((isHomeRoute || isProfileRoute) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((isLoginRoute || isRegisterRoute) && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if ((isHomeRoute || isProfileRoute) && user && !user.email_confirmed_at) {
    return NextResponse.redirect(new URL("/login?message=confirm-email", request.url));
  }

  if (isForgotPasswordRoute && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
