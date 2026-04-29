"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getRoleHomeHref,
  getRoleNavLinks,
  getRoleProfileHref,
  type RoleScope,
} from "@/lib/role-routes";

interface NavbarProps {
  user: {
    email?: string;
    user_metadata: {
      full_name?: string;
    };
  } | null;
  userType?: string;
  role?: string;
  roleScope: RoleScope;
}

export function Navbar({ user, roleScope }: NavbarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
  const isSidebarLayout =
    pathname.startsWith("/admin") || pathname.startsWith("/governance");

  if (isAuthPage) return null;
  if (isSidebarLayout) return null;
  if (!user && !isLandingPage) return null;

  const userLinks = getRoleNavLinks(roleScope);
  const homeHref = getRoleHomeHref(roleScope);
  const profileHref = getRoleProfileHref(roleScope);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex justify-center pointer-events-none transition-all duration-500">
      <div
        className={cn(
          "pointer-events-auto w-full transition-all duration-500",
          isScrolled
            ? "mt-6 max-w-6xl rounded-[2rem] border border-slate-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur-md"
            : "mt-0 max-w-[1400px] rounded-none border-b border-transparent bg-transparent px-6 py-6 shadow-none md:px-12",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href={!user ? "/" : homeHref}
            className="flex shrink-0 items-center"
          >
            <div
              className={cn(
                "flex items-center transition-all duration-500",
                isScrolled ? "h-9" : "h-14",
              )}
            >
              <Image
                src="/logoV2.png"
                alt="Rembuka Logo"
                width={200}
                height={80}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {!user ? (
              <div></div>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-2 py-2",
                  isScrolled
                    ? "border-slate-200 bg-white"
                    : "border-white/50 bg-white/70 backdrop-blur",
                )}
              >
                {userLinks.map((link) => {
                  const active =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                        active
                          ? "bg-[#11538C] text-white"
                          : "text-slate-600 hover:text-[#11538C]",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="hidden text-sm font-semibold text-slate-700 transition-colors hover:text-[#11538C] sm:block"
                >
                  Masuk
                </Link>
                <Button
                  asChild
                  className="rounded-full bg-[#11538C] px-6 font-sans text-white shadow-none hover:bg-[#0c3e6b]"
                >
                  <Link href="/register">Daftar</Link>
                </Button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsMobileOpen((open) => !open)}
                  className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-[#11538C]/30 hover:text-[#11538C] lg:hidden"
                >
                  {isMobileOpen ? (
                    <X className="size-5" />
                  ) : (
                    <Menu className="size-5" />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={cn(
                      "flex items-center gap-2 rounded-full transition-all duration-500",
                      isScrolled
                        ? "border border-slate-200 bg-white py-1 pl-2 pr-3 shadow-sm hover:bg-slate-50"
                        : "bg-white/80 p-1 backdrop-blur hover:opacity-80",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-full bg-[#11538C] font-bold text-white shadow-sm transition-all duration-500",
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
                    {isProfileOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsProfileOpen(false)}
                          className="fixed inset-0 z-[-1]"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-72 rounded-[1.5rem] border border-slate-100 bg-white p-2 shadow-2xl"
                        >
                          <div className="mb-1 border-b border-slate-50 px-4 py-3">
                            <p className="mb-1.5 text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400">
                              Halo,
                            </p>
                            <p className="truncate text-sm font-bold text-[#1A1F2B]">
                              {user.user_metadata.full_name}
                            </p>
                          </div>
                          <Link
                            href={profileHref}
                            onClick={() => setIsProfileOpen(false)}
                            className="mt-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            <User className="size-4 text-slate-400" />{" "}
                            Pengaturan Akun
                          </Link>

                          <form action="/signout" method="post">
                            <button
                              type="submit"
                              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-50"
                            >
                              <LogOut className="size-4 text-rose-400" /> Keluar
                            </button>
                          </form>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {user && isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-lg lg:hidden"
            >
              <div className="grid gap-2">
                {userLinks.map((link) => {
                  const active =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-sm font-bold transition-colors",
                        active
                          ? "border-[#11538C] bg-[#11538C] text-white"
                          : "border-slate-200 bg-white text-slate-600",
                      )}
                    >
                      <span className="block">{link.label}</span>
                      <span
                        className={cn(
                          "mt-1 block text-[11px] font-medium",
                          active ? "text-blue-100" : "text-slate-400",
                        )}
                      >
                        {link.description}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
