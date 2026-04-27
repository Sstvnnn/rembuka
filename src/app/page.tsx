"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Network,
  PieChart,
  BrainCircuit,
  Users,
  Trophy,
  Wallet,
  Building2,
  TreePine,
  GraduationCap,
  ChevronDown,
  ChevronLeftIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/shared/footer"; 

export default function LandingPage() {
  // --- Animation Variants ---
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const slideInRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#F6F5F2] text-[#1A1F2B] font-sans overflow-x-hidden selection:bg-[#11538C]/20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-8"
        >
          <motion.h1
            variants={fadeUp}
            className="font-heading text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-[#1A1F2B] leading-[1.1] tracking-tight"
          >
            Opini Jadi Data, <br />
            <span className="text-[#11538C] italic">Kebijakan Jadi Nyata.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-base md:text-lg text-slate-600 leading-relaxed"
          >
            Rembuka adalah ruang partisipasi publik berbasis AI. Hentikan debat
            kusir, temukan konsensus bersama, dan tentukan prioritas anggaran
            daerahmu dengan sistem voting yang adil.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              asChild
              className="h-12 px-8 rounded-full bg-[#11538C] text-white font-medium shadow-none hover:bg-[#0c3e6b] hover:scale-105 transition-all"
            >
              <Link href="/register">
                Mulai Berpartisipasi <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 px-8 rounded-full border-slate-300 bg-white text-slate-700 font-medium shadow-sm hover:bg-slate-50 transition-all"
            >
              <Link href="/about">Pelajari Cara Kerjanya</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#11538C] py-12 md:py-16 overflow-hidden">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-white/20"
        >
          {[
            { num: "12k+", label: "Warga Aktif" },
            { num: "4.8k", label: "Proposal" },
            { num: "89%", label: "Konsensus Tercapai" },
            { num: "34", label: "Kota/Kabupaten" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`text-center space-y-2 ${i === 3 ? "border-l border-white/20 md:border-l-0 pl-8 md:pl-0" : ""}`}
            >
              <p className="font-heading text-4xl md:text-5xl font-bold text-white">
                {stat.num}
              </p>
              <p className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CORE FEATURES SUMMARY SECTION */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto text-center overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-2xl mx-auto space-y-4 mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1A1F2B]">
            Tiga Pilar Partisipasi Digital
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto">
            Meninggalkan sistem interaksi usang, Rembuka menyediakan tiga alat
            analitik canggih untuk memastikan setiap suara dihargai secara
            proporsional dan transparan.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6 text-left"
        >
          <motion.div
            variants={fadeUp}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
          >
            <div className="size-10 rounded-full bg-white border border-green-600/20 flex items-center justify-center text-green-700 mb-6">
              <Network className="size-5" />
            </div>
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold tracking-widest uppercase rounded-full mb-4">
              Peta Konsensus
            </div>
            <h3 className="text-xl font-bold font-heading text-[#1A1F2B] mb-3">
              Musyawarah Berbasis Data
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Sampaikan respons pada isu publik tanpa adu mulut. Teknologi AI
              memetakan opini warga untuk menemukan titik temu dan kesepakatan
              bersama.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
          >
            <div className="size-10 rounded-full bg-white border border-[#11538C]/20 flex items-center justify-center text-[#11538C] mb-6">
              <MapPin className="size-5" />
            </div>
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold tracking-widest uppercase rounded-full mb-4">
              Usulan Warga
            </div>
            <h3 className="text-xl font-bold font-heading text-[#1A1F2B] mb-3">
              Prioritas Anggaran Kolektif
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Pilih 3 prioritas pendanaan di wilayahmu. Sistem{" "}
              <i>Weighted Ranking</i> memastikan usulan yang paling dibutuhkan
              warga didahulukan secara adil.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
          >
            <div className="size-10 rounded-full bg-white border border-orange-400/20 flex items-center justify-center text-orange-700 mb-6">
              <PieChart className="size-5" />
            </div>
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold tracking-widest uppercase rounded-full mb-4">
              Transparansi
            </div>
            <h3 className="text-xl font-bold font-heading text-[#1A1F2B] mb-3">
              Visualisasi Alokasi Anggaran
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Lihat langsung rincian pendanaan proyek-proyek yang memenangkan
              voting di kota Anda. Pantau penggunaan setiap Rupiah anggaran
              daerah.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURE 1: CONSENSUS MAP (POL.IS) */}
      <section className="py-24 px-6 bg-[#F0EFEC] overflow-hidden border-t border-slate-200">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center"
        >
          <motion.div
            variants={slideInLeft}
            className="space-y-6 order-2 md:order-1"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1A1F2B]">
              Urai Perdebatan, <br /> Temukan Konsensus
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Fitur Papan Opini interaktif kami mengubah cara berdiskusi. Tidak
              ada lagi debat panjang di kolom komentar. Algoritma kami memetakan
              respons warga secara visual dan secara otomatis menyoroti{" "}
              <strong>&quot;Konsensus Kasar&quot;</strong>—titik temu yang
              disetujui bersama oleh berbagai kubu yang berbeda pendapat.
            </p>
          </motion.div>

          <motion.div
            variants={slideInRight}
            className="relative bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col order-1 md:order-2 transition-transform hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Live Analysis
                </span>
                <h3 className="font-bold text-lg text-[#1A1F2B] leading-none mt-1">
                  Klaster: RUU Tata Ruang
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-500">
                  89% Setuju
                </span>
              </div>
            </div>

            <div className="relative flex-grow rounded-xl border border-dashed border-slate-200 bg-[#F6F5F2]/50 overflow-hidden mt-2">
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-24 bg-green-500 rounded-full blur-xl"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-green-500/30 px-3 py-1 rounded-full bg-green-50 text-[10px] font-bold text-green-700 z-10 shadow-sm backdrop-blur-sm">
                Titik Konsensus (89%)
              </div>

              {/* Group A */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute top-1/4 left-1/4 flex flex-col items-center"
              >
                <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded mb-2">
                  Group A
                </div>
                <div className="relative w-20 h-20">
                  <div className="absolute top-0 left-0 size-6 rounded-full border-2 border-white bg-slate-300 shadow-sm"></div>
                  <div className="absolute top-4 left-6 size-5 rounded-full border-2 border-white bg-slate-400 shadow-sm"></div>
                  <div className="absolute top-8 left-2 size-7 rounded-full border-2 border-white bg-slate-500 shadow-sm"></div>
                </div>
              </motion.div>

              {/* Group B */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-1/4 right-1/4 flex flex-col items-center"
              >
                <div className="relative w-24 h-24 mb-2">
                  <div className="absolute top-2 right-2 size-8 rounded-full border-2 border-white bg-slate-400 shadow-sm"></div>
                  <div className="absolute top-8 right-8 size-6 rounded-full border-2 border-white bg-slate-600 shadow-sm"></div>
                  <div className="absolute bottom-6 right-12 size-7 rounded-full border-2 border-white bg-slate-500 shadow-sm"></div>
                </div>
                <div className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                  Group B
                </div>
              </motion.div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Pernyataan Mayoritas
              </p>
              <p className="text-sm font-medium text-slate-700 italic">
                &quot;Pembangunan ruang terbuka hijau harus didahulukan dari
                penambahan lajur kendaraan bermotor.&quot;
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURE 2: MUSRENBANG (WEIGHTED VOTING) */}
      <section className="py-24 px-6 bg-[#F6F5F2] overflow-hidden border-t border-slate-200">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center"
        >
          <motion.div
            variants={slideInLeft}
            className="relative bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col order-2 md:order-1 hover:shadow-lg transition-transform"
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Musrenbang Daerah
                </span>
                <h3 className="font-bold text-lg text-[#1A1F2B] leading-none mt-1">
                  Prioritas Pendanaan
                </h3>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-[#11538C] text-xs font-bold rounded-full flex items-center gap-1">
                <Trophy className="size-3" /> Prioritas
              </div>
            </div>

            <div className="space-y-3 flex-grow">
              {/* Rank 1 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-3 rounded-xl border-2 border-[#11538C] bg-blue-50/50 cursor-default transition-all"
              >
                <div className="flex flex-col items-center justify-center size-12 bg-[#11538C] text-white rounded-lg font-bold shrink-0 shadow-sm">
                  <span className="text-lg leading-none">1</span>
                  <span className="text-[8px] uppercase tracking-wider">
                    st
                  </span>
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-bold text-[#1A1F2B]">
                    Perbaikan Drainase Utama
                  </h4>
                  <p className="text-xs text-slate-500">
                    Estimasi: Rp 1.2M • 250 Dukungan
                  </p>
                </div>
                <div className="px-2 py-1 bg-blue-100 text-[#11538C] text-xs font-bold rounded whitespace-nowrap">
                  +3 Poin
                </div>
              </motion.div>

              {/* Rank 2 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-white cursor-default transition-all"
              >
                <div className="flex flex-col items-center justify-center size-12 bg-slate-100 text-slate-600 rounded-lg font-bold shrink-0">
                  <span className="text-lg leading-none">2</span>
                  <span className="text-[8px] uppercase tracking-wider">
                    nd
                  </span>
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-bold text-[#1A1F2B]">
                    Subsidi Internet Sekolah
                  </h4>
                  <p className="text-xs text-slate-500">
                    Estimasi: Rp 800Jt • 180 Dukungan
                  </p>
                </div>
                <div className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded whitespace-nowrap">
                  +2 Poin
                </div>
              </motion.div>

              {/* Rank 3 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-white cursor-default transition-all"
              >
                <div className="flex flex-col items-center justify-center size-12 bg-slate-100 text-slate-600 rounded-lg font-bold shrink-0">
                  <span className="text-lg leading-none">3</span>
                  <span className="text-[8px] uppercase tracking-wider">
                    rd
                  </span>
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-bold text-[#1A1F2B]">
                    Renovasi Puskesmas Induk
                  </h4>
                  <p className="text-xs text-slate-500">
                    Estimasi: Rp 1.5M • 150 Dukungan
                  </p>
                </div>
                <div className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded whitespace-nowrap">
                  +1 Poin
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            variants={slideInRight}
            className="space-y-6 order-1 md:order-2"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1A1F2B]">
              Tentukan Prioritas <br /> Secara Kolektif
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Sistem &quot;Upvote&quot; tunggal terlalu mudah dimanipulasi.
              Fitur Musrenbang kami menggunakan metode{" "}
              <strong>Weighted Ranking (3-2-1)</strong>. Warga harus memilih 3
              usulan paling krusial, memastikan proyek yang didanai benar-benar
              merepresentasikan kebutuhan mendesak mayoritas, bukan sekadar adu
              popularitas.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURE 3: BUDGET VISUALIZER (INTERACTIVE MAP UI) */}
      <section className="py-24 px-6 bg-[#F0EFEC] overflow-hidden border-t border-slate-200">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center"
        >
          <motion.div
            variants={slideInLeft}
            className="space-y-6 order-2 md:order-1"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1A1F2B]">
              Pantau Pembangunan <br /> Tiap Kecamatan
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Transparansi anggaran tidak seharusnya berupa baris Excel yang
              sulit dipahami. Melalui alat <i>Budget Map Visualizer</i>, cukup
              arahkan kursor ke wilayahmu untuk melihat status serapan anggaran
              dan proyek yang sedang berjalan.
            </p>
          </motion.div>

          {/* Budget MAP Mockup (Retro Geographic - Consistent Light UI) */}
          <motion.div
            variants={slideInRight}
            className="relative bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[420px] flex flex-col order-1 md:order-2 hover:shadow-lg transition-transform duration-300"
          >
            {/* Header Map */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 z-10">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  APBD Terbuka (TA 2025)
                </span>
                <h3 className="font-bold text-lg text-[#1A1F2B] leading-none mt-1">
                  Peta Anggaran Kota
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 cursor-pointer hover:border-slate-300 transition-colors">
                Jakarta <ChevronDown className="size-3.5 opacity-60" />
              </div>
            </div>

            {/* Abstract Vector Map Wrapper */}
            <div className="relative w-full flex-grow rounded-xl overflow-hidden bg-[#F6F5F2] border border-slate-200 shadow-inner">
              {/* Tooltip Simulation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute top-6 right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-200 z-20 w-48 pointer-events-none"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Jakarta Barat
                  </p>
                  <span className="flex size-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <p className="text-xl font-black text-[#11538C] mb-3">
                  Rp 1.2 Triliun
                </p>
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 w-[65%] h-full" />
                  </div>
                </div>
              </motion.div>

              {/* SVG Abstract Map Elements (Realistic Jagged Region Paths) */}
              <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
                {/* Map Grid / Blueprint lines (Retro Feel) */}
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Region 1 (Jkt Barat - Left) */}
                <motion.path
                  d="M 60,150 L 75,130 L 80,140 L 100,110 L 120,115 L 130,130 L 150,125 L 170,160 L 165,180 L 180,210 L 170,240 L 150,245 L 130,280 L 100,270 L 85,290 L 60,270 L 70,230 L 50,200 L 55,170 Z"
                  fill="#e0f2fe"
                  stroke="#bae6fd"
                  strokeWidth="2"
                  whileHover={{
                    fill: "#bae6fd",
                    stroke: "#0284c7",
                    strokeWidth: 2,
                  }}
                  className="cursor-pointer transition-colors duration-300 drop-shadow-sm"
                />

                {/* Region 2 (Jkt Timur - Top Right) */}
                <motion.path
                  d="M 150,125 L 170,100 L 190,105 L 210,80 L 240,90 L 260,120 L 290,115 L 310,150 L 300,180 L 320,210 L 290,230 L 260,220 L 230,250 L 200,230 L 180,210 L 165,180 L 170,160 Z"
                  fill="#dcfce7"
                  stroke="#bbf7d0"
                  strokeWidth="2"
                  whileHover={{
                    fill: "#bbf7d0",
                    stroke: "#16a34a",
                    strokeWidth: 2,
                  }}
                  className="cursor-pointer transition-colors duration-300 drop-shadow-sm"
                />

                {/* Region 3 (Jkt Selatan - Bottom Right) */}
                <motion.path
                  d="M 180,210 L 200,230 L 230,250 L 260,220 L 290,230 L 320,210 L 340,240 L 370,250 L 350,290 L 370,330 L 330,350 L 300,340 L 270,370 L 230,350 L 210,320 L 170,300 L 130,280 L 150,245 L 170,240 Z"
                  fill="#ffedd5"
                  stroke="#fed7aa"
                  strokeWidth="2"
                  whileHover={{
                    fill: "#fed7aa",
                    stroke: "#ea580c",
                    strokeWidth: 2,
                  }}
                  className="cursor-pointer transition-colors duration-300 drop-shadow-sm"
                />

                {/* Highlighted Overlay for Jkt Barat (Matches Tooltip) */}
                <motion.path
                  d="M 60,150 L 75,130 L 80,140 L 100,110 L 120,115 L 130,130 L 150,125 L 170,160 L 165,180 L 180,210 L 170,240 L 150,245 L 130,280 L 100,270 L 85,290 L 60,270 L 70,230 L 50,200 L 55,170 Z"
                  fill="#bae6fd"
                  stroke="#11538C"
                  strokeWidth="2.5"
                  className="cursor-pointer drop-shadow-md"
                />

                {/* Map Labels */}
                <text
                  x="110"
                  y="200"
                  className="text-[10px] font-bold fill-[#11538C] pointer-events-none font-sans"
                  textAnchor="middle"
                >
                  Jakarta BARAT
                </text>
                <text
                  x="240"
                  y="160"
                  className="text-[10px] font-bold fill-green-800 pointer-events-none font-sans"
                  textAnchor="middle"
                >
                  Jakarta TIMUR
                </text>
                <text
                  x="260"
                  y="290"
                  className="text-[10px] font-bold fill-orange-800 pointer-events-none font-sans"
                  textAnchor="middle"
                >
                  Jakarta SELATAN
                </text>

                {/* Data Points / Pins */}
                <circle
                  cx="110"
                  cy="180"
                  r="4"
                  fill="#11538C"
                  className="animate-pulse"
                />
                <circle cx="240" cy="140" r="4" fill="#16a34a" />
                <circle cx="260" cy="270" r="4" fill="#ea580c" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="max-w-2xl mx-auto space-y-8"
        >
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-[#1A1F2B] leading-tight">
            Siap Membawa <br /> Perubahan?
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Bergabunglah dengan ribuan warga lainnya yang sudah aktif membentuk
            masa depan kota kita bersama.
          </p>
          <Button
            asChild
            className="h-12 px-8 rounded-full bg-[#11538C] text-white font-medium hover:bg-[#0c3e6b] hover:scale-105 transition-all shadow-lg shadow-[#11538C]/20"
          >
            <Link href="/register">
              Daftar Sekarang <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
