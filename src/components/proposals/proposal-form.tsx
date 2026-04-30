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
  Info,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import { createProposalAction } from "@/app/actions/musrenbang";
import { getProvinceFromCity } from "@/lib/constants/locations";
import {
  CATEGORY_MAPPING,
  REVERSE_CATEGORY_MAPPING,
} from "@/lib/constants/mappings";
import { ProposalPeriod } from "@/types/musrenbang";
import {
  formatPeriodDateTime,
  ProposalPhase,
  getProposalPhaseDescription,
  getProposalPhaseLabel,
} from "@/lib/proposal-periods";

const categories = Object.values(CATEGORY_MAPPING);

interface ProposalFormProps {
  defaultLocation: string;
  isVerified: boolean;
  canSubmit: boolean;
  currentPhase: ProposalPhase;
  activePeriod: ProposalPeriod | null;
}

export function ProposalForm({
  defaultLocation,
  isVerified,
  canSubmit,
  currentPhase,
  activePeriod,
}: ProposalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const province = useMemo(
    () => getProvinceFromCity(defaultLocation),
    [defaultLocation],
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Infrastruktur",
    estimated_cost: 0,
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const isProposalOpen = currentPhase === "proposal";
  const isFormLocked =
    !canSubmit || !isVerified || !activePeriod || !isProposalOpen;

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
    const nextImages = images.filter(
      (_, currentIndex) => currentIndex !== index,
    );
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
      setError(
        "Hanya warga terverifikasi yang dapat mengajukan proposal pembangunan.",
      );
      return;
    }

    if (currentPhase !== "proposal") {
      setError(
        "Masa pengajuan belum dibuka atau sudah berakhir untuk wilayah Anda.",
      );
      return;
    }

    if (!formData.title || !formData.description || !formData.estimated_cost) {
      setError("Mohon lengkapi seluruh data wajib.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append(
      "category",
      REVERSE_CATEGORY_MAPPING[formData.category] || formData.category,
    );
    data.append("estimated_cost", formData.estimated_cost.toString());
    images.forEach((image) => data.append("images", image));

    startTransition(async () => {
      try {
        await createProposalAction(data);
        setSuccess(
          "Proposal berhasil diajukan. Mengalihkan ke daftar wilayah...",
        );
        setTimeout(() => router.push("/proposals"), 1500);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan yang tidak terduga.",
        );
      }
    });
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          className="h-9 px-3 text-slate-500 hover:text-slate-900"
        >
          <Link href="/proposals" className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> Kembali
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          {/* Header Status Bar */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <FileText className="size-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Formulir Pengajuan Baru
                  </h2>
                  <p className="text-sm text-slate-500">
                    Isi detail usulan pembangunan dengan jelas
                  </p>
                </div>
              </div>

              {!isVerified && (
                <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600">
                  <AlertCircle className="size-4" />
                  Belum Terverifikasi
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-0">
            {/* Status Alert Panels */}
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
              <div className="space-y-4">
                {activePeriod ? (
                  <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <CalendarRange className="mt-0.5 size-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">
                          Jadwal Wilayah Aktif:{" "}
                          {getProposalPhaseLabel(currentPhase)}
                        </p>
                        <p className="mt-1 text-sm text-blue-700/80">
                          {getProposalPhaseDescription(currentPhase)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-left text-xs font-medium text-blue-800 sm:text-right">
                      <p>
                        Pengajuan:{" "}
                        <span className="font-semibold">
                          {formatPeriodDateTime(activePeriod.proposal_start_at)}
                        </span>
                      </p>
                      <p>
                        Voting:{" "}
                        <span className="font-semibold">
                          {formatPeriodDateTime(activePeriod.voting_start_at)}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <Info className="size-5 shrink-0 text-amber-600" />
                    <p>
                      Pemerintah wilayah Anda belum menetapkan jadwal pengajuan
                      dan voting.
                    </p>
                  </div>
                )}

                {!canSubmit && (
                  <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <AlertCircle className="size-5 shrink-0" />
                    <p>
                      Halaman ini khusus untuk warga. Akun pemerintah dan admin
                      tidak dapat mengajukan proposal.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Form Area */}
            {isFormLocked ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
                  <LayoutDashboard className="size-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
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
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  {!activePeriod
                    ? "Tunggu sampai pemerintah wilayah menetapkan jadwal pengajuan dan voting."
                    : currentPhase === "upcoming"
                      ? `Form akan dibuka pada ${formatPeriodDateTime(activePeriod.proposal_start_at)}.`
                      : currentPhase === "voting"
                        ? "Fokus wilayah sekarang adalah pemungutan suara. Anda tidak dapat membuat proposal baru sampai periode berikutnya."
                        : currentPhase === "review"
                          ? "Masa pengajuan sudah berakhir dan proposal sedang ditinjau pemerintah wilayah."
                          : currentPhase === "results"
                            ? "Periode ini telah selesai. Tunggu periode baru dari pemerintah wilayah."
                            : "Form pengajuan belum tersedia."}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="divide-y divide-slate-100">
                {/* 1. Informasi Lokasi */}
                <div className="px-6 py-6 sm:px-8">
                  <h3 className="mb-4 text-sm font-bold text-slate-900">
                    1. Informasi Wilayah (Otomatis)
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Provinsi
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={province}
                          readOnly
                          className="h-11 cursor-not-allowed bg-slate-50 pl-10 text-slate-600 focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Kota / Kabupaten
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={defaultLocation}
                          readOnly
                          className="h-11 cursor-not-allowed bg-slate-50 pl-10 text-slate-600 focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Detail Proposal */}
                <div className="px-6 py-6 sm:px-8">
                  <h3 className="mb-4 text-sm font-bold text-slate-900">
                    2. Detail Proposal
                  </h3>
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600">
                          Kategori
                        </Label>
                        <div className="relative">
                          <Tag className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <select
                            value={formData.category}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                category: event.target.value,
                              })
                            }
                            className="flex h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-10 pr-4 text-sm transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                        <Label className="text-xs font-semibold text-slate-600">
                          Estimasi Biaya (Rp)
                        </Label>
                        <div className="relative">
                          <Wallet className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            type="number"
                            min={1}
                            value={formData.estimated_cost || ""}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                estimated_cost: Number(event.target.value),
                              })
                            }
                            placeholder="Contoh: 15000000"
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Judul Singkat Usulan
                      </Label>
                      <Input
                        value={formData.title}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            title: event.target.value,
                          })
                        }
                        placeholder="Misal: Perbaikan lampu jalan di Jalan Melati"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Deskripsi & Argumentasi
                      </Label>
                      <textarea
                        rows={5}
                        value={formData.description}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            description: event.target.value,
                          })
                        }
                        placeholder="Jelaskan alasan pengajuan, kondisi saat ini, dan manfaat bagi warga..."
                        className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Dokumentasi */}
                <div className="px-6 py-6 sm:px-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      3. Dokumentasi Visual
                    </h3>
                    <span className="text-xs text-slate-500">
                      1 - 4 Foto Pendukung
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {previews.map((url, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                      >
                        <Image
                          src={url}
                          alt="preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-rose-500/90 text-white shadow-sm backdrop-blur-sm transition-all hover:bg-rose-600"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {images.length < 4 && (
                      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-blue-500 hover:bg-blue-50/50">
                        <Upload className="size-6 text-slate-400" />
                        <span className="mt-2 text-xs font-medium text-slate-500">
                          Unggah Foto
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Section */}
                <div className="bg-slate-50 px-6 py-6 sm:px-8">
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                      >
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <p>{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        <p>{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={
                      isPending || !canSubmit || currentPhase !== "proposal"
                    }
                    className="h-12 w-full bg-blue-600 text-sm font-semibold text-white transition-all hover:bg-blue-700 sm:w-auto sm:px-8"
                  >
                    {isPending ? (
                      <LoadingSpinner className="mr-2" />
                    ) : (
                      "Kirim Aspirasi"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
