/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Calendar, Gavel, Loader2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" },
    },
};

type Legal = {
    id: string;
    final_summary: string;
    file_name: string;
    created_at?: string;
};

export default function LegalListPage() {
    const supabase = createClient();
    const [list, setList] = useState<Legal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Fetching legal list...");
        fetchLegal();
    }, []);

    async function fetchLegal() {
        setLoading(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user || !user.id) {
                console.warn(
                    "No authenticated user found; aborting fetchLegal.",
                );
                setList([]);
                return;
            }

            const { data: citizenProfile, error: profileError } = await supabase
                .from("users")
                .select(
                    "id, nik, email, full_name, location, citizen_card_path, verification_status, created_at",
                )
                .eq("id", user.id)
                .maybeSingle();

            if (profileError) {
                console.error("Error fetching user profile:", profileError);
                return;
            }

            const userLocation = citizenProfile?.location;
            console.log("User location:", userLocation);

            const allowedCities = [userLocation, "Nasional"];

            const { data, error } = await supabase
                .from("legal_analysis")
                .select(
                    `
                        id,
                        final_summary,
                        file_name,
                        created_at,
                        documents!inner(id, city)
                    `,
                )
                .in("documents.city", allowedCities);

            if (data) {
                const mapped: Legal[] = data.map((item: any) => ({
                    id: item.id,
                    final_summary: item.final_summary,
                    file_name: item.file_name,
                    created_at: item.created_at,
                }));
                setList(mapped);
            }

            if (error) {
                console.error("Error fetching legal list:", error);
                return;
            }
        } catch (err) {
            console.error("Unexpected error fetching legal list:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F4F6FA] font-sans">
            <main className="pt-32">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
                >
                    <motion.section
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl text-white shadow-xl min-h-[320px] flex items-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d6b]/95 via-[#11538C]/75 to-[#0a2540]/35" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_30%)]" />
                        <div className="relative z-10 p-8 md:p-12 lg:p-14 max-w-3xl">
                            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-lg">
                                Daftar regulasi yang selaras dengan lokasi Anda
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm md:text-base text-blue-100/90 leading-relaxed">
                                Lihat regulasi yang dipetakan dari data wilayah
                                Anda, dengan tampilan yang lebih ringkas,
                                kontekstual, dan mudah dibaca.
                            </p>
                        </div>
                    </motion.section>

                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Regulasi ditampilkan
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {loading ? "..." : list.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Filter lokasi aktif
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                Ya
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Akses detail
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                Langsung
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Tampilan
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                Modern
                            </p>
                        </div> */}
                    </section>

                    <motion.section
                        variants={itemVariants}
                        className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">
                                    Daftar Regulasi
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Klik kartu untuk membuka ringkasan lengkap.
                                </p>
                            </div>
                            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                                <MapPin className="size-3" />
                                Sesuai lokasi
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="size-6 text-blue-400 animate-spin" />
                            </div>
                        ) : list.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                                Belum ada regulasi yang cocok dengan lokasi
                                Anda.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {list.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/legal/${item.id}`}
                                    >
                                        <div className="group h-full rounded-2xl border border-slate-100 bg-slate-50/60 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md">
                                            <div className="flex items-start justify-between gap-3">
                                                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                                                    <Gavel className="size-3" />
                                                    Regulasi
                                                </span>
                                                <ArrowRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                                            </div>

                                            <h3 className="mt-4 text-base font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                                                {item.file_name ||
                                                    "Regulasi tanpa nama"}
                                            </h3>

                                            <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
                                                {item.final_summary ||
                                                    "Ringkasan belum tersedia untuk regulasi ini."}
                                            </p>

                                            <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
                                                <Calendar className="size-3" />
                                                {item.created_at
                                                    ? new Date(
                                                          item.created_at,
                                                      ).toLocaleDateString(
                                                          "id-ID",
                                                          {
                                                              day: "numeric",
                                                              month: "long",
                                                              year: "numeric",
                                                          },
                                                      )
                                                    : "Tanggal tidak tersedia"}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.section>
                </motion.div>
            </main>
        </div>
    );
}
