"use client";

import { useMemo } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ReTooltip,
  Legend
} from "recharts";
import { 
  Wallet, 
  Info, 
  PieChart as PieIcon, 
  Building2, 
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BudgetItem, UserTaxProfile } from "@/types/musrenbang";
import { CATEGORY_MAPPING } from "@/lib/constants/mappings";

const COLORS = [
  "#3F5C73", // Primary
  "#4FB3B3", // Secondary
  "#F25C7A", // Rose
  "#F2B705", // Amber
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#8B5CF6", // Violet
];

interface BudgetVisualizerProps {
  budgetItems: BudgetItem[];
  initialTaxProfile: UserTaxProfile | null;
}

export function BudgetVisualizer({ budgetItems, initialTaxProfile }: BudgetVisualizerProps) {
  const taxPaid = initialTaxProfile?.estimated_tax_paid ?? 0;
  const hasTaxProfile = !!initialTaxProfile;

  const totalBudget = useMemo(() => 
    budgetItems.reduce((acc, item) => acc + Number(item.amount), 0), 
  [budgetItems]);

  const chartData = useMemo(() => {
    return budgetItems.map(item => ({
      name: item.title,
      value: Number(item.amount),
      contribution: hasTaxProfile ? (taxPaid * (Number(item.amount) / totalBudget)) : 0
    }));
  }, [budgetItems, taxPaid, totalBudget, hasTaxProfile]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    budgetItems.forEach(item => {
      // Use display name for grouping to match hero section logic
      const displayName = CATEGORY_MAPPING[item.category] || item.category;
      categories[displayName] = (categories[displayName] || 0) + Number(item.amount);
    });
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      contribution: hasTaxProfile ? (taxPaid * (value / totalBudget)) : 0
    }));
  }, [budgetItems, taxPaid, totalBudget, hasTaxProfile]);

  const getContributionForCategory = (categoryKey: string) => {
    const item = categoryData.find(c => c.name === (CATEGORY_MAPPING[categoryKey] || categoryKey));
    return item ? item.contribution : 0;
  };

  const formatIDR = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      {/* Personalized Hero - Only shown if profile exists */}
      {hasTaxProfile && (
        <section className="grid gap-8 lg:grid-cols-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative overflow-hidden rounded-[3rem] border border-white/20 bg-[#3F5C73] p-10 text-white shadow-2xl transition-all"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                <Wallet className="size-3 text-[#4FB3B3]" />
                Rincian Pajak Pribadi
              </div>
              <h2 className="mt-8 font-heading text-4xl font-black leading-tight sm:text-5xl">
                Ke Mana <br />
                <span className="text-[#4FB3B3]">Kontribusi</span> Anda Pergi.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                Berdasarkan estimasi pajak tahunan Anda sebesar <span className="text-white font-bold">{formatIDR(taxPaid)}</span>, 
                kami memetakan secara tepat bagaimana uang Anda mendanai anggaran regional tahun 2025.
              </p>
              
              <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Infrastruktur</p>
                  <p className="text-xl font-bold text-white">{formatIDR(getContributionForCategory("Infrastructure"))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendidikan</p>
                  <p className="text-xl font-bold text-white">{formatIDR(getContributionForCategory("Education"))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kesehatan</p>
                  <p className="text-xl font-bold text-white">{formatIDR(getContributionForCategory("Health"))}</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-[#4FB3B3]/10 blur-3xl group-hover:bg-[#4FB3B3]/20 transition-all duration-700" />
          </motion.div>
        </section>
      )}

      {/* Visualizations */}
      <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-[2.5rem] border-white/60 bg-white/40 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardHeader className="bg-slate-900/5 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#3F5C73] text-white">
                  <PieIcon className="size-5" />
                </div>
                <CardTitle className="text-xl font-black text-slate-800 tracking-tight uppercase">Alokasi Anggaran</CardTitle>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Anggaran</p>
                <p className="text-lg font-black text-[#3F5C73]">{formatIDR(totalBudget)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => formatIDR(Number(value))}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 px-2">Pos Pengeluaran Teratas</h3>
          <div className="space-y-4">
            {chartData.sort((a,b) => b.value - a.value).slice(0, 5).map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex items-center justify-between p-5 rounded-3xl border border-white/60 bg-white/40 hover:bg-white/80 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#4FB3B3] group-hover:text-white transition-all">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                    {hasTaxProfile && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Kontribusi Anda: <span className="text-[#4FB3B3]">{formatIDR(item.contribution)}</span></p>
                    )}
                    {!hasTaxProfile && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{formatIDR(item.value)}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-all" />
              </motion.div>
            ))}
          </div>
          
          <Card className="rounded-[2rem] border-blue-100 bg-blue-50/50 p-6">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">{hasTaxProfile ? "Bagaimana ini dihitung?" : "Tentang Alokasi Ini"}</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-700/80">
                  {hasTaxProfile 
                    ? "Kami mengambil total anggaran regional dan rasio kontribusi Anda. Ini menampilkan representasi proporsional tentang bagaimana pajak Anda didistribusikan ke berbagai proyek publik yang aktif."
                    : "Data ini mewakili alokasi anggaran regional resmi untuk tahun fiskal 2026. Data dikumpulkan dari laporan transparansi publik pemerintah."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
