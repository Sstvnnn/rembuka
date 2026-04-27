"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

export function Footer() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const, 
      },
    },
  };

  return (
    <footer className="border-t border-slate-200 py-16 bg-[#F6F5F2] overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm"
      >
        {/* Brand */}
        <motion.div
          variants={itemVariants}
          className="col-span-2 md:col-span-1 space-y-4"
        >
          <Link
            href="/"
            className="font-heading font-black text-xl text-[#11538C] tracking-tight"
          >
            Rembuka
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed">
            © 2026 Rembuka Civic Network.
            <br />
            Opini Jadi Data, Kebijakan Jadi Nyata.
            <br />
            Built for the people.
          </p>
        </motion.div>

        {/* Platform */}
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="font-bold text-[#1A1F2B] mb-4">Platform</p>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            Tentang Kami
          </Link>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            Cara Kerja
          </Link>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            Hubungi Kami
          </Link>
        </motion.div>

        {/* Legal */}
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="font-bold text-[#1A1F2B] mb-4">Legalitas</p>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            Kebijakan Privasi
          </Link>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            Syarat Ketentuan
          </Link>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            Data Terbuka
          </Link>
        </motion.div>

        {/* Community */}
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="font-bold text-[#1A1F2B] mb-4">Komunitas</p>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            FAQ & Panduan
          </Link>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            Pusat Bantuan
          </Link>
          <Link
            href="#"
            className="block text-slate-600 hover:text-[#11538C] transition-colors"
          >
            Blog Warga
          </Link>
        </motion.div>
      </motion.div>
    </footer>
  );
}
