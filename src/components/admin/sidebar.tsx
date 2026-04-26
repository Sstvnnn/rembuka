"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Home,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
          Menu Admin
        </h2>
        <nav className="space-y-2">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
              pathname === "/admin"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
            )}
          >
            <LayoutDashboard className="size-5" />
            Dashboard
          </Link>
          <Link
            href="/admin/queue"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
              pathname.startsWith("/admin/queue")
                ? "bg-blue-50 text-blue-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
            )}
          >
            <Users className="size-5" />
            Antrian Verifikasi
          </Link>
          <Link
            href="/admin/tracker"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
              pathname.startsWith("/admin/tracker")
                ? "bg-blue-50 text-blue-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
            )}
          >
            <FileCheck className="size-5" />
            Tracker
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 px-4 py-3 text-sm font-bold transition-colors"
          >
            <User className="size-5" />
            Identitas
          </Link>

          <form
            action="/signout"
            method="post"
            className="pt-4 mt-4 border-t border-slate-100"
          >
            <button
              type="submit"
              className="w-full flex items-center gap-3 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-4 py-3 text-sm font-bold transition-colors"
            >
              <LogOut className="size-5" />
              Keluar Aman
            </button>
          </form>
        </nav>
      </div>
    </aside>
  );
}
