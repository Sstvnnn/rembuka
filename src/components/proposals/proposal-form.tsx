"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MapPin,
  Tag,
  Wallet,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Upload,
  X,
  Globe,
  CalendarRange,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import { createProposalAction } from "@/app/actions/musrenbang";
import { getProvinceFromCity } from "@/lib/constants/locations";
import { CATEGORY_MAPPING, REVERSE_CATEGORY_MAPPING } from "@/lib/constants/mappings";
import { ProposalPeriod } from "@/types/musrenbang";
import { formatPeriodDateTime, ProposalPhase, getProposalPhaseDescription, getProposalPhaseLabel } from "@/lib/proposal-periods";

const categories = Object.values(CATEGORY_MAPPING);

interface ProposalFormProps {
  defaultLocation: string;
  isVerified: boolean;
  canSubmit: boolean;
  currentPhase: ProposalPhase;
  activePeriod: ProposalPeriod | null;
}

export function ProposalForm({ defaultLocation, isVerified, canSubmit, currentPhase, activePeriod }: ProposalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const province = useMemo(() => getProvinceFromCity(defaultLocation), [defaultLocation]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Infrastruktur",
    estimated_cost: 0,
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const isProposalOpen = currentPhase === "proposal";
  const isFormLocked = !canSubmit || !isVerified || !activePeriod || !isProposalOpen;
  const phaseTone =
    currentPhase === "proposal"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : currentPhase === "voting"
        ? "border-amber-100 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (images.length + files.length > 4) {
      setError("Maksimal 4 gambar dapat diunggah.");
      return;
    }

    const nextImages = [...images, ...files];
    setImages(nextImages);
    setPreviews(nextImages.map((file) => URL.createObjectURL(file)));
    setError("");
  };

  const removeImage = (index: number) => {
    const nextImages = images.filter((_, currentIndex) => currentIndex !== index);
    setImages(nextImages);
    setPreviews(nextImages.map((file) => URL.createObjectURL(file)));
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isFormLocked && !canSubmit) {
      setError("Fitur ini hanya dapat digunakan oleh warga.");
      return;
    }

    if (!isVerified) {
      setError("Hanya warga terverifikasi yang dapat mengajukan aspirasi daerah.");
      return;
    }

    if (currentPhase !== "proposal") {
      setError("Masa pengajuan belum dibuka atau sudah berakhir untuk wilayah Anda.");
      return;
    }

    if (!formData.title || !formData.description || !formData.estimated_cost) {
      setError("Mohon lengkapi seluruh data wajib.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", REVERSE_CATEGORY_MAPPING[formData.category] || formData.category);
    data.append("estimated_cost", formData.estimated_cost.toString());
    images.forEach((image) => data.append("images", image));

    startTransition(async () => {
      try {
        await createProposalAction(data);
        setSuccess("Aspirasi berhasil diajukan. Mengalihkan ke daftar wilayah...");
        setTimeout(() => router.push("/proposals"), 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" className="rounded-xl text-slate-500 hover:text-slate-800">
          <Link href="/proposals" className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> Kembali ke Ruang Aspirasi Daerah
          </Link>
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/40 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-4 border-b border-slate-100 bg-slate-50/50 p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#3F5C73] text-white shadow-xl shadow-[#3F5C73]/20">
                  <FileText className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4FB3B3]">Ruang Aspirasi Daerah</p>
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-800">Aspirasi Baru</CardTitle>
                </div>
              </div>
              {!isVerified ? (
                <div className="flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-rose-500">
                  <AlertCircle className="size-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Belum Terverifikasi</span>
                </div>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-8">
            {activePeriod ? (
              <div className="rounded-[2rem] border border-slate-100 bg-white/80 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3 text-slate-800">
                  <CalendarRange className="size-5 text-[#4FB3B3]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status Jadwal</p>
                    <p className="text-sm font-bold">{getProposalPhaseLabel(currentPhase)}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-500">{getProposalPhaseDescription(currentPhase)}</p>
                <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                  <p>Pengajuan: {formatPeriodDateTime(activePeriod.proposal_start_at)} - {formatPeriodDateTime(activePeriod.proposal_end_at)}</p>
                  <p>Voting: {formatPeriodDateTime(activePeriod.voting_start_at)} - {formatPeriodDateTime(activePeriod.voting_end_at)}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                Pemerintah wilayah Anda belum menetapkan jadwal pengajuan dan voting.
              </div>
            )}

            {!canSubmit ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                Halaman ini khusus untuk warga. Akun pemerintah dan admin tidak dapat mengajukan aspirasi.
              </div>
            ) : null}

            {canSubmit ? (
              <div className={`rounded-2xl border p-4 text-sm ${phaseTone}`}>
                <p className="font-bold uppercase tracking-wide">
                  {isProposalOpen ? "Masa Pengajuan Aktif" : currentPhase === "voting" ? "Masa Pengajuan Ditutup" : "Form Pengajuan Ditutup"}
                </p>
                <p className="mt-2 leading-relaxed">
                  {isProposalOpen
                    ? "Form pengajuan terbuka. Setiap warga hanya dapat mengirim satu aspirasi pada periode ini."
                    : currentPhase === "voting"
                      ? "Saat ini wilayah Anda sedang memasuki sesi voting. Form pengajuan ditutup sampai pemerintah membuat periode berikutnya."
                      : getProposalPhaseDescription(currentPhase)}
                </p>
              </div>
            ) : null}

            {isFormLocked ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-800">
                  {currentPhase === "upcoming"
                    ? "Pengajuan Belum Dimulai"
                    : currentPhase === "voting"
                      ? "Sesi Voting Sedang Berlangsung"
                      : currentPhase === "review"
                        ? "Tahap Tinjauan Pemerintah"
                        : currentPhase === "results"
                          ? "Periode Ini Sudah Selesai"
                          : "Form Belum Tersedia"}
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
                  {!activePeriod
                    ? "Tunggu sampai pemerintah wilayah menetapkan jadwal pengajuan dan voting."
                    : currentPhase === "upcoming"
                      ? `Form akan dibuka pada ${formatPeriodDateTime(activePeriod.proposal_start_at)}.`
                      : currentPhase === "voting"
                        ? "Fokus wilayah sekarang adalah pemungutan suara. Anda tidak dapat membuat aspirasi baru sampai periode berikutnya."
                        : currentPhase === "review"
                          ? "Masa pengajuan sudah berakhir dan proposal sedang ditinjau pemerintah wilayah."
                          : currentPhase === "results"
                            ? "Periode ini telah selesai. Tunggu periode baru dari pemerintah wilayah."
                            : "Form pengajuan belum tersedia."}
                </p>
              </div>
            ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Provinsi</Label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input value={province} readOnly className="h-12 cursor-default rounded-2xl border-slate-200 bg-slate-100/50 pl-11 font-medium text-slate-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Kota / Kabupaten</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input value={defaultLocation} readOnly className="h-12 cursor-default rounded-2xl border-slate-200 bg-slate-100/50 pl-11 font-medium text-slate-500" />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Kategori</Label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.category}
                      onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                      className="flex h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 text-sm transition-all focus:bg-white"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Estimasi Biaya (Rp)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="number"
                      min={1}
                      value={formData.estimated_cost || ""}
                      onChange={(event) => setFormData({ ...formData, estimated_cost: Number(event.target.value) })}
                      placeholder="Masukkan anggaran"
                      className="h-12 rounded-2xl border-slate-200 bg-white/50 pl-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Judul Aspirasi</Label>
                <div className="relative">
                  <LayoutDashboard className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    placeholder="Misal: Perbaikan lampu jalan lingkungan"
                    className="h-12 rounded-2xl border-slate-200 bg-white/50 pl-11 transition-all focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Dokumentasi (1-4 Foto)</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {previews.map((url, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200">
                      <Image src={url} alt="preview" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 ? (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-[#4FB3B3] hover:bg-white">
                      <Upload className="size-5 text-slate-400" />
                      <span className="mt-2 text-[10px] font-bold uppercase text-slate-400">Tambah Foto</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi</Label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Jelaskan masalah, manfaat, dan kebutuhan warga di lingkungan Anda."
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 p-4 text-sm transition-all focus:bg-white focus:outline-none"
                />
              </div>

              <AnimatePresence mode="wait">
                {error ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-600">
                    <AlertCircle className="size-4" /> {error}
                  </motion.div>
                ) : null}
                {success ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="size-4" /> {success}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <Button disabled={isPending || !canSubmit || currentPhase !== "proposal"} className="h-14 w-full rounded-2xl bg-[#3F5C73] text-base font-bold text-white shadow-xl hover:bg-[#314b60]">
                {isPending ? <LoadingSpinner className="mr-2" /> : "Ajukan Aspirasi"}
              </Button>
            </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
