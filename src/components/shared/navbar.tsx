"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShieldCheck,
    LayoutDashboard,
    User,
    Users,
    LogOut,
    ChevronDown,
    Bell,
    MessageSquare,
    TrendingUp,
    Zap,
    Book,
} from "lucide-react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useMotionValueEvent,
} from "framer-motion";
import { useState, useEffect } from "react";
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

    if (isAuthPage) return null;
    if (!user && !isLandingPage) return null;

    const adminLinks = [
        { name: "Antrian", href: "/admin/queue", icon: Users },
        { name: "Beranda", href: "/home", icon: LayoutDashboard },
        { name: "Identitas", href: "/profile", icon: User },
    ];

    const userLinks = [
        { name: "Beranda", href: "/home", icon: LayoutDashboard },
        { name: "Proposal", href: "/proposals", icon: MessageSquare },
        { name: "Anggaran", href: "/budget", icon: TrendingUp },
        { name: "Profil", href: "/profile", icon: User },
        { name: "Legal", href: "/legal", icon: Book },
    ];

    const landingLinks = [
        { name: "Platform", href: "#", icon: Zap },
        { name: "Pemerintah", href: "#", icon: ShieldCheck },
        { name: "Komunitas", href: "#", icon: Users },
    ];

    const links = !user ? landingLinks : isAdmin ? adminLinks : userLinks;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 pointer-events-none">
            <div
                className={cn(
                    "mx-auto transition-all duration-500 flex items-center justify-between pointer-events-auto",
                    isScrolled
                        ? "max-w-4xl mt-6 rounded-full border border-white/60 bg-white/40 px-6 py-2 shadow-2xl backdrop-blur-2xl"
                        : "max-w-full mt-0 rounded-none border-b border-slate-100 bg-white px-8 py-4 shadow-none",
                )}
            >
                {/* Brand */}
                <Link
                    href={!user ? "/" : isAdmin ? "/admin/queue" : "/home"}
                    className="flex items-center gap-3 group"
                >
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-xl bg-[#3F5C73] text-white transition-all duration-500 shadow-[#3F5C73]/20",
                            isScrolled
                                ? "size-9 shadow-lg"
                                : "size-10 shadow-xl",
                        )}
                    >
                        <ShieldCheck
                            className={isScrolled ? "size-4" : "size-5"}
                        />
                    </div>
                    <div
                        className={cn(
                            "transition-all duration-500",
                            isScrolled ? "hidden sm:block" : "block",
                        )}
                    >
                        <h1
                            className={cn(
                                "font-black text-slate-800 tracking-tight uppercase leading-none",
                                isScrolled ? "text-xs" : "text-lg",
                            )}
                        >
                            Rembuka
                        </h1>
                        {!isScrolled && (
                            <p className="text-[10px] font-bold text-[#4FB3B3] uppercase tracking-widest leading-none mt-1">
                                {!user
                                    ? "Jaringan Kewargaan"
                                    : isAdmin
                                      ? "Konsol Admin"
                                      : "Identitas Terverifikasi"}
                            </p>
                        )}
                    </div>
                </Link>

                {/* Navigation Links */}
                <div
                    className={cn(
                        "flex items-center gap-1 transition-all duration-500",
                        isScrolled
                            ? "bg-slate-900/5 p-1 rounded-full border border-slate-900/5"
                            : "gap-4 md:gap-8",
                    )}
                >
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "relative flex items-center gap-2 transition-all duration-300",
                                    isScrolled
                                        ? cn(
                                              "px-4 py-1.5 text-[10px] font-bold rounded-full",
                                              isActive
                                                  ? "text-white"
                                                  : "text-slate-500 hover:text-slate-800",
                                          )
                                        : cn(
                                              "px-0 py-2 text-sm font-bold",
                                              isActive
                                                  ? "text-[#3F5C73]"
                                                  : "text-slate-400 hover:text-slate-800",
                                          ),
                                )}
                            >
                                {isScrolled && isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[#3F5C73] rounded-full shadow-md"
                                    />
                                )}
                                <link.icon
                                    className={cn(
                                        "relative z-10 transition-all duration-300",
                                        isScrolled ? "size-3.5" : "size-4",
                                        isActive && !isScrolled
                                            ? "text-[#3F5C73]"
                                            : "",
                                    )}
                                />
                                <span
                                    className={cn(
                                        "relative z-10",
                                        isScrolled
                                            ? "hidden md:block"
                                            : "block",
                                    )}
                                >
                                    {link.name}
                                </span>
                                {!isScrolled && isActive && (
                                    <motion.div
                                        layoutId="activeUnderline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3F5C73] rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {!user ? (
                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                variant="ghost"
                                className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#3F5C73] rounded-xl"
                            >
                                <Link href="/login">Masuk</Link>
                            </Button>
                            <Button
                                asChild
                                className="bg-[#3F5C73] text-white text-xs font-bold uppercase tracking-widest px-6 rounded-xl shadow-lg shadow-[#3F5C73]/20 hover:bg-[#314b60]"
                            >
                                <Link href="/register">Daftar</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!isScrolled && (
                                <button className="flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                                    <Bell className="size-5" />
                                </button>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setIsProfileOpen(!isProfileOpen)
                                    }
                                    className={cn(
                                        "flex items-center gap-2 rounded-full transition-all duration-500",
                                        isScrolled
                                            ? "pl-2 pr-3 py-1 bg-white/80 border border-slate-100 shadow-sm"
                                            : "p-1",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "rounded-full bg-gradient-to-tr from-[#3F5C73] to-[#4FB3B3] flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white transition-all duration-500",
                                            isScrolled
                                                ? "size-7 text-[10px]"
                                                : "size-9 text-xs",
                                        )}
                                    >
                                        {user.user_metadata.full_name?.charAt(
                                            0,
                                        ) ?? "U"}
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            "size-3 text-slate-400 transition-transform duration-300",
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
                                                onClick={() =>
                                                    setIsProfileOpen(false)
                                                }
                                                className="fixed inset-0 z-[-1]"
                                            />
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: 10,
                                                    scale: 0.95,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    y: 10,
                                                    scale: 0.95,
                                                }}
                                                className="absolute right-0 mt-3 w-56 rounded-[1.5rem] border border-slate-100 bg-white shadow-2xl p-2"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                                                        Identitas Pengguna
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-800 truncate">
                                                        {
                                                            user.user_metadata
                                                                .full_name
                                                        }
                                                    </p>
                                                </div>

                                                <Link
                                                    href="/profile"
                                                    onClick={() =>
                                                        setIsProfileOpen(false)
                                                    }
                                                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                                >
                                                    <User className="size-4 text-slate-400" />{" "}
                                                    Pengaturan Akun
                                                </Link>

                                                <form
                                                    action="/signout"
                                                    method="post"
                                                >
                                                    <button
                                                        type="submit"
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                    >
                                                        <LogOut className="size-4 text-rose-400" />{" "}
                                                        Keluar Aman
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
        </nav>
    );
}
