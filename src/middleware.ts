import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { getRoleHomePath } from "@/lib/role-routes";

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
    pathname.startsWith("/citizen") ||
    pathname.startsWith("/governance") ||
    pathname.startsWith("/home") || 
    pathname.startsWith("/profile") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/tracker") ||
    pathname.startsWith("/transparency") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/proposals");

  const isAdminRoute = pathname.startsWith("/admin");
  const isGovernanceRoute = pathname.startsWith("/governance");
  const isCitizenRoute = pathname.startsWith("/citizen");

  // 1. If trying to access protected route but no auth user, go to login
  if ((isProtectedRoute || isAdminRoute) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If user is authenticated
  if (user) {
    // Check if user is in Governance table
    const { data: govProfile } = await supabase
      .from("governance")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = govProfile?.role === "admin";
    const isGovUser = !!govProfile;
    const roleHomePath = getRoleHomePath({
      userType: isGovUser ? "governance" : "citizen",
      role: govProfile?.role || "citizen",
    });

    // A. Role-based Route Protection
    const citizenOnlyPaths = ["/budget", "/tracker", "/transparency", "/legal"];
    const govOnlyPaths = ["/legal/admin"]; // governance dashboards
    
    // 1. Block non-admins from /admin routes
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL(roleHomePath, request.url));
    }

    // 2. Block governance from citizen-only routes
    if (isGovUser && citizenOnlyPaths.some(p => pathname.startsWith(p)) && !isAdmin) {
      return NextResponse.redirect(new URL(roleHomePath, request.url));
    }

    // 3. Block citizens from governance routes
    if (!isGovUser && govOnlyPaths.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL(roleHomePath, request.url));
    }

    if (isCitizenRoute && (isGovUser || isAdmin)) {
      return NextResponse.redirect(new URL(roleHomePath, request.url));
    }

    if (isGovernanceRoute && (!isGovUser || isAdmin)) {
      return NextResponse.redirect(new URL(roleHomePath, request.url));
    }

    // B. Check if email is confirmed (Supabase level)
    if (!user.email_confirmed_at) {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/login?message=confirm-email", request.url));
      }
    } else {
      // B. Check profile for Citizens
      if (!isGovUser) {
        const { data: citizenProfile } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!citizenProfile && isProtectedRoute) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/register?message=incomplete-registration", request.url));
        }
      }

      // C. Don't let authenticated users back into auth pages
      if (isAuthRoute) {
        return NextResponse.redirect(new URL(roleHomePath, request.url));
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
