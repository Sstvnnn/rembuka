"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  LogOut,
  MessageSquare,
  ScrollText,
  type LucideIcon,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AdminSidebarProps = {
  scope?: "admin" | "governance";
  location?: string | null;
};

const adminLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/admin/home", icon: LayoutDashboard },
  { label: "Antrian Verifikasi", href: "/admin/queue", icon: Users },
];

const governanceLinks: SidebarLink[] = [
  {
    label: "Dashboard",
    href: "/governance/home",
    icon: LayoutDashboard,
  },
  {
    label: "Regulasi Kebijakan",
    href: "/governance/legal",
    icon: FileText,
  },
  {
    label: "Proposal Warga",
    href: "/governance/proposals",
    icon: ScrollText,
  },
  { label: "Tracker", href: "/governance/tracker", icon: FileCheck },
];

export default function AdminSidebar({
  scope = "admin",
  location,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const links = scope === "governance" ? governanceLinks : adminLinks;

  return (
    <aside className="group/sidebar w-64 border-r border-slate-200 bg-white flex-shrink-0 h-screen sticky top-0 overflow-y-auto flex flex-col">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <Link
          href={scope === "governance" ? "/governance/home" : "/admin/home"}
          className="flex items-center"
        >
          <Image
            src="/logoV2.png"
            alt="Rembuka Logo"
            width={140}
            height={56}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="p-4">
        {/* --- BAGIAN JUDUL SIDEBAR YANG DIUBAH --- */}
        <div className="mb-4 px-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {scope === "governance" ? "Menu Governance" : "Menu Admin"}
          </p>
          {/* Jika scope governance dan lokasi ada, tampilkan di baris bawahnya */}
          {scope === "governance" && location && (
            <p className="text-[11px] font-bold text-blue-600 mt-1 truncate uppercase tracking-wider">
              {location}
            </p>
          )}
        </div>
        {/* ---------------------------------------- */}

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== `/${scope}/home` &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                )}
              >
                <link.icon className="size-[18px]" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign-out */}
      <div className="border-t border-slate-100 p-4">
        <form action="/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-rose-500 px-3 py-2.5 text-sm font-semibold transition-colors"
          >
            <LogOut className="size-[18px]" />
            Keluar Akun
          </button>
        </form>
      </div>
    </aside>
  );
}
