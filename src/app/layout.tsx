import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Navbar } from "@/components/shared/navbar";
import { getSafeProfile } from "@/lib/profile";
import { getRoleScope } from "@/lib/role-routes";
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
  const profileData = await getSafeProfile();
  const user = profileData?.user;
  const userType = profileData?.userType || "citizen";
  const role = profileData?.role || "citizen";
  const roleScope = getRoleScope({ userType, role });

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
      <body className="min-h-full flex flex-col bg-[#F6F5F2]">
        <AppProviders>
          <Navbar 
            user={navbarUser} 
            userType={userType} 
            role={role} 
            roleScope={roleScope}
          />
          <main className="flex-1">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
