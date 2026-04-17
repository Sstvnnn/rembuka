import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  // Public routes (auth flow)
  const isAuthRoute = 
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-otp") ||
    pathname.startsWith("/reset-password");

  // Protected routes
  const isProtectedRoute = 
    pathname.startsWith("/home") || 
    pathname.startsWith("/profile");

  const isAdminRoute = pathname.startsWith("/admin");

  // 1. If trying to access protected route but no auth user, go to login
  if ((isProtectedRoute || isAdminRoute) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If user is authenticated
  if (user) {
    // Admin check
    const isAdmin = user.email === "rembuka.id@gmail.com";
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    // A. Check if email is confirmed (Supabase level)
    if (!user.email_confirmed_at) {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/login?message=confirm-email", request.url));
      }
    } else {
      // B. Email is confirmed. Now check if they exist in our 'public.users' table
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      // If they have an auth session but NO profile in our table, 
      // they are effectively "not registered" in our app logic.
      if (!profile && isProtectedRoute) {
        // Sign them out and send back to register
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/register?message=incomplete-registration", request.url));
      }

      // C. If they ARE fully registered, don't let them back into auth pages
      if (profile && isAuthRoute) {
        return NextResponse.redirect(new URL("/home", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
