"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#1A1F2B] font-sans flex flex-col md:flex-row selection:bg-[#11538C]/20 overflow-hidden">
      {/* Sisi Kiri - Panel Branding (Biru) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex md:w-[45%] lg:w-1/2 bg-[#11538C] p-10 lg:p-20 flex-col justify-between text-white relative"
      >
        {/* Dekorasi Latar Belakang Subtil */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#0c3e6b]/50 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* GRUP ATAS: Logo & Headline dirapatkan */}
          <div className="flex flex-col">
            <Link href="/" className="block mb-8 md:mb-10">
              <Image
                src="/logoV2.png"
                alt="Rembuka Logo"
                width={300}
                height={100}
                // Ukuran logo yang lebih berwibawa
                className="w-48 md:w-56 lg:w-64 h-auto object-contain brightness-0 invert"
                priority
              />
            </Link>

            <h1 className="font-heading text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              Opini Jadi Data, <br />
              <span className="text-white/70 italic">
                Kebijakan Jadi Nyata.
              </span>
            </h1>
          </div>

          {/* FOOTER: Tetap di paling bawah */}
          <div className="mt-auto pt-10">
            <p className="text-sm text-white/50 font-medium tracking-wide">
              © 2026 Rembuka.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sisi Kanan - Kontainer Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 relative">
        {/* Tombol Kembali (Mobile & Desktop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-8 left-8 md:right-12 md:left-auto z-20"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#11538C] transition-colors"
          >
            <ArrowLeft className="size-4 md:hidden" />
            <span className="hidden md:inline-block">Kembali ke Beranda</span>
          </Link>
        </motion.div>

        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
