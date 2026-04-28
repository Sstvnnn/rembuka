import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rute Publik (alur autentikasi)
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-otp") ||
    pathname.startsWith("/reset-password");

  // Rute Warga / Umum
  const isProtectedRoute =
    pathname.startsWith("/home") || pathname.startsWith("/profile");

  // Rute Khusus Pemerintahan
  const isAdminRoute = pathname.startsWith("/admin");
  const isGovernanceRoute = pathname.startsWith("/governance");

  // 1. Jika mencoba akses rute terproteksi tapi belum login -> tendang ke login
  if ((isProtectedRoute || isAdminRoute || isGovernanceRoute) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Jika user SUDAH login
  if (user) {
    // Cek apakah user ada di tabel Governance
    const { data: govProfile } = await supabase
      .from("governance")
      .select("role")
      .eq("id", user.id)
      .single();

    // Normalisasi string role agar aman dari case-sensitive (huruf besar/kecil)
    const userRole = govProfile?.role?.toLowerCase();
    const isGovUser = !!govProfile;

    // --- LOGIKA PROTEKSI HALAMAN BERBASIS ROLE ---

    // A. Blokir akses ke /admin jika BUKAN admin
    if (isAdminRoute && userRole !== "admin") {
      // Jika dia governance, lempar ke /governance. Jika warga, lempar ke /home.
      const redirectUrl = userRole === "governance" ? "/governance" : "/home";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // B. Blokir akses ke /governance jika BUKAN governance
    if (isGovernanceRoute && userRole !== "governance") {
      // Jika dia admin, lempar ke /admin. Jika warga, lempar ke /home.
      const redirectUrl = userRole === "admin" ? "/admin" : "/home";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // --- LOGIKA KELENGKAPAN PROFIL & EMAIL ---

    // C. Cek konfirmasi email
    if (!user.email_confirmed_at) {
      if (isProtectedRoute || isAdminRoute || isGovernanceRoute) {
        return NextResponse.redirect(
          new URL("/login?message=confirm-email", request.url),
        );
      }
    } else {
      // D. Cek profil Warga (hanya jika dia BUKAN orang pemerintahan)
      if (!isGovUser) {
        const { data: citizenProfile } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!citizenProfile && isProtectedRoute) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            new URL("/register?message=incomplete-registration", request.url),
          );
        }
      }

      // E. Mencegah user yang sudah login kembali ke halaman Auth (/login, /register, dll)
      if (isAuthRoute) {
        // Redirect sesuai porsi masing-masing!
        if (userRole === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else if (userRole === "governance") {
          return NextResponse.redirect(new URL("/governance", request.url));
        } else {
          return NextResponse.redirect(new URL("/home", request.url));
        }
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
