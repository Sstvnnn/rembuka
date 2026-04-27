"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  User,
  LogOut,
  ChevronDown,
  Bell,
  MessageSquare,
  TrendingUp,
  Book,
  FileCheck,
  History,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user: {
    email?: string;
    user_metadata: {
      full_name?: string;
    };
  } | null;
  isAdmin: boolean;
}

export function Navbar({ user, isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-otp" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  const isLandingPage = pathname === "/";

  if (isAdmin) return null;
  if (isAuthPage) return null;
  if (!user && !isLandingPage) return null;

  const userLinks = [
    { name: "Proposal", href: "/proposals", icon: MessageSquare },
    { name: "Anggaran", href: "/budget", icon: TrendingUp },
    { name: "Legal", href: "/legal", icon: Book },
    { name: "Track", href: "/tracker", icon: FileCheck },
    { name: "Riwayat", href: "/transparency", icon: History },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 pointer-events-none flex justify-center">
      <div
        className={cn(
          "transition-all duration-500 flex items-center justify-between pointer-events-auto w-full",
          isScrolled
            ? "max-w-5xl mt-6 rounded-full border border-slate-200 bg-white/90 px-6 py-3 shadow-sm backdrop-blur-md"
            : "max-w-[1400px] mt-0 rounded-none border-b border-transparent bg-transparent px-6 py-6 md:px-12 shadow-none",
        )}
      >
        {/* Brand */}
        <Link
          href={!user ? "/" : "/home"}
          className="flex items-center shrink-0"
        >
          <div className="flex gap-3 items-center">
            <Image
              src="/logo-rembuka-rm.png"
              alt="Rembuka Logo"
              width={isScrolled ? 24 : 32}
              height={isScrolled ? 24 : 32}
              className="transition-all duration-500"
              priority
            />
            <span
              className={cn(
                "font-heading font-black text-[#11538C] tracking-tight transition-all duration-500",
                isScrolled ? "text-lg" : "text-2xl",
              )}
            >
              Rembuka
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Sekarang tetap muncul saat di-scroll) */}
        <div className="hidden lg:flex items-center gap-8">
          {!user && (
            <div
              className={cn(
                "flex items-center gap-8 text-sm font-medium transition-colors",
                isScrolled ? "text-slate-500" : "text-slate-600",
              )}
            >
              <Link
                href="#"
                className="text-[#11538C] border-b border-[#11538C] pb-0.5 italic"
              >
                Platform
              </Link>
              <Link href="#" className="hover:text-[#11538C] transition-colors">
                Initiatives
              </Link>
              <Link href="#" className="hover:text-[#11538C] transition-colors">
                Community
              </Link>
              <Link href="#" className="hover:text-[#11538C] transition-colors">
                Resources
              </Link>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
              {userLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 hover:text-[#11538C] transition-colors"
                >
                  <link.icon className="size-4 opacity-70" />
                  <span className={isScrolled ? "hidden md:block" : "block"}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {!user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-[#11538C] transition-colors hidden sm:block"
              >
                Login
              </Link>
              <Button
                asChild
                className="rounded-full bg-[#11538C] text-white hover:bg-[#0c3e6b] px-6 shadow-none font-sans"
              >
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          ) : (
            <>
              {!isScrolled && (
                <button className="flex size-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#11538C] hover:border-[#11538C]/30 transition-all shadow-sm">
                  <Bell className="size-5" />
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={cn(
                    "flex items-center gap-2 rounded-full transition-all duration-500",
                    isScrolled
                      ? "pl-2 pr-3 py-1 bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
                      : "p-1 hover:opacity-80",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full bg-[#11538C] flex items-center justify-center font-bold text-white shadow-sm transition-all duration-500",
                      isScrolled ? "size-7 text-[10px]" : "size-9 text-xs",
                    )}
                  >
                    {user.user_metadata.full_name?.charAt(0) ?? "U"}
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-3 text-slate-500 transition-transform duration-300",
                      isProfileOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {/* ... (Menu Dropdown Profile Tetap Sama) ... */}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
