import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Navbar } from "@/components/shared/navbar";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rembuka",
  description:
    "Civic-tech super app for Ruang Aspirasi Daerah and Ruang Wacana Publik.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: govProfile } = await supabase
      .from("governance")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = govProfile?.role === "admin";
  }

  // Safely cast user metadata for the Navbar
  const navbarUser = user
    ? {
        email: user.email,
        user_metadata: {
          full_name: user.user_metadata.full_name as string | undefined,
        },
      }
    : null;

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8fafc]">
        <AppProviders>
          <Navbar user={navbarUser} isAdmin={isAdmin} />
          <main className="flex-1">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
