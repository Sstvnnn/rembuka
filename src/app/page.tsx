"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ArrowRight, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Zap,
  Globe,
  CheckCircle2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Variants } from "framer-motion";

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] selection:bg-[#4FB3B3]/30 overflow-hidden">
      {/* Retro Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233F5C73' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
      />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] size-96 bg-[#4FB3B3]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-10%] size-[500px] bg-[#3F5C73]/5 rounded-full blur-[140px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center space-y-8"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200 shadow-sm backdrop-blur-md">
              <Zap className="size-4 text-[#F25C7A]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Masa Depan Partisipasi Publik</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="font-heading text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.95]"
            >
              Suarakan <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#3F5C73] via-[#4FB3B3] to-[#3F5C73] animate-gradient-x">aspirasi</span>,<br />
              bangun kota Anda.
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="max-w-2xl text-lg md:text-xl text-slate-500 font-medium leading-relaxed"
            >
              Rembuka adalah jaringan kewargaan digital yang menghubungkan masyarakat dengan pemerintah. Ajukan, diskusikan, dan tentukan pembangunan daerah melalui Musrenbang digital.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild className="h-14 px-8 rounded-2xl bg-[#3F5C73] text-white font-bold text-lg shadow-2xl shadow-[#3F5C73]/20 hover:bg-[#314b60] hover:scale-105 transition-all active:scale-95">
                <Link href="/register">Mulai Sekarang <ArrowRight className="ml-2 size-5" /></Link>
              </Button>
              <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white/50 backdrop-blur-md text-slate-600 font-bold text-lg hover:bg-white hover:border-[#4FB3B3] transition-all">
                <Link href="/login">Masuk</Link>
              </Button>
            </motion.div>

            {/* Dashboard Preview mockup */}
            <motion.div 
              variants={itemVariants}
              className="relative mt-20 w-full max-w-5xl aspect-[16/10] rounded-[2.5rem] border-[8px] border-white bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden group"
            >
              {/* Browser Header */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-4 z-20">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-rose-400/20" />
                  <div className="size-3 rounded-full bg-amber-400/20" />
                  <div className="size-3 rounded-full bg-emerald-400/20" />
                </div>
                <div className="h-6 w-64 rounded-lg bg-white border border-slate-200/60 flex items-center px-3 gap-2">
                  <div className="size-2 rounded-full bg-[#4FB3B3]/20" />
                  <div className="h-1.5 w-full rounded-full bg-slate-100" />
                </div>
              </div>
              
              <div className="flex h-full pt-12">
                {/* Mock Sidebar */}
                <div className="w-56 border-r border-slate-100 bg-slate-50/50 p-6 space-y-8 hidden md:block">
                  <div className="space-y-3">
                    <div className="h-2 w-12 bg-slate-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-8 w-full bg-[#3F5C73]/10 rounded-xl" />
                      <div className="h-8 w-full bg-transparent rounded-xl" />
                      <div className="h-8 w-full bg-transparent rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-16 bg-slate-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-8 w-full bg-transparent rounded-xl" />
                      <div className="h-8 w-full bg-transparent rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="flex-1 p-8 overflow-hidden bg-slate-50/30">
                  <div className="flex items-end justify-between mb-8">
                    <div className="space-y-2 text-left">
                      <div className="h-2 w-20 bg-[#4FB3B3]/40 rounded-full" />
                      <div className="h-6 w-48 bg-slate-800 rounded-lg" />
                    </div>
                    <div className="h-10 w-32 bg-[#3F5C73] rounded-xl shadow-lg shadow-[#3F5C73]/20" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 space-y-4">
                        <div className="aspect-video rounded-2xl bg-slate-100 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                          <div className="absolute top-3 left-3 h-5 w-16 bg-white/80 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-slate-100 rounded-md" />
                          <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-6 w-20 bg-slate-50 rounded-full" />
                          <div className="size-8 rounded-full bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/40 backdrop-blur-[2px] z-30">
                 <div className="px-6 py-3 rounded-2xl bg-white shadow-2xl border border-slate-100 text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="size-4 text-[#4FB3B3]" /> 
                   Buka Aplikasi
                 </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="space-y-4 p-8 rounded-[2rem] bg-[#f8fafc] border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="size-12 rounded-2xl bg-[#3F5C73] flex items-center justify-center text-white shadow-lg shadow-[#3F5C73]/20">
                <MessageSquare className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Musrenbang Digital</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Ajukan proposal infrastruktur atau sosial langsung dari lingkungan Anda. Tanpa birokrasi, langsung pada hasil.</p>
            </div>

            <div className="space-y-4 p-8 rounded-[2rem] bg-[#f8fafc] border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="size-12 rounded-2xl bg-[#4FB3B3] flex items-center justify-center text-white shadow-lg shadow-[#4FB3B3]/20">
                <TrendingUp className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Peringkat Langsung</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Lihat aspirasi masyarakat yang paling didukung. Sistem penilaian transparan kami memastikan prioritas yang tepat.</p>
            </div>

            <div className="space-y-4 p-8 rounded-[2rem] bg-[#f8fafc] border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="size-12 rounded-2xl bg-[#F25C7A] flex items-center justify-center text-white shadow-lg shadow-[#F25C7A]/20">
                <Shield className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Identitas Terverifikasi</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Verifikasi NIK terenkripsi memastikan setiap suara berasal dari warga asli dalam wilayah tersebut.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="rounded-[3rem] bg-slate-900 p-12 md:p-20 relative overflow-hidden text-center md:text-left">
            <div className="absolute top-[-20%] right-[-10%] size-96 bg-[#4FB3B3]/10 rounded-full blur-[100px]" />
            <div className="relative z-10 grid gap-12 md:grid-cols-[1.5fr_1fr] items-center">
              <div className="space-y-6">
                <h2 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight">Memberdayakan lebih dari <span className="text-[#4FB3B3]">10,000+</span> warga untuk menentukan masa depan.</h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-xl">Bergabunglah hari ini dan mulai berkontribusi dalam proyek pembangunan kota Anda.</p>
                <div className="flex flex-wrap gap-8 pt-6">
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-white leading-none">4.8k</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proposal Terverifikasi</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-white leading-none">92%</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kepuasan Warga</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-white leading-none">12.5M</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Anggaran Terlacak</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="size-64 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                  <Globe className="size-32 text-[#4FB3B3] animate-pulse" />
                  <div className="absolute top-0 right-0 size-12 rounded-full bg-[#F25C7A] flex items-center justify-center text-white shadow-xl">
                    <CheckCircle2 className="size-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#3F5C73] text-white flex items-center justify-center shadow-lg shadow-[#3F5C73]/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 tracking-tight uppercase leading-none text-lg">Rembuka</h2>
              <p className="text-[10px] font-bold text-[#4FB3B3] uppercase tracking-widest leading-none mt-1">Jaringan Kewargaan</p>
            </div>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-slate-800 transition-colors">Platform</Link>
            <Link href="#" className="hover:text-slate-800 transition-colors">Privasi</Link>
            <Link href="#" className="hover:text-slate-800 transition-colors">Pemerintah</Link>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Rembuka. Dibangun untuk masyarakat.</p>
        </div>
      </footer>
    </div>
  );
}
