"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  User,
  MapPin,
  IdCard,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  Eye,
  X,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { VERIFICATION_STATUS_MAPPING } from "@/lib/constants/mappings";
import {
  INDONESIA_LOCATIONS,
  getProvinceFromCity,
} from "@/lib/constants/locations";

interface QueuedUser {
  id: string;
  nik: string;
  email: string;
  full_name: string;
  location: string;
  citizen_card_path: string;
  card_url: string;
  created_at: string;
  verification_status: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminQueuePage() {
  const [queue, setQueue] = useState<QueuedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<QueuedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeProvince, setActiveProvince] = useState("Semua");
  const [activeLocation, setActiveLocation] = useState("Semua");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const provinces = ["Semua", ...Object.keys(INDONESIA_LOCATIONS)];

  const locations = useMemo(() => {
    if (activeProvince === "Semua") {
      const allCities = Object.values(INDONESIA_LOCATIONS).flat();
      return ["Semua", ...Array.from(new Set(allCities)).sort()];
    }
    return ["Semua", ...(INDONESIA_LOCATIONS[activeProvince] || [])];
  }, [activeProvince]);

  async function fetchQueue() {
    try {
      const res = await fetch("/api/admin/queue");
      const data = await res.json();
      setQueue(data.queue || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueue();
  }, []);

  async function handleVerify(userId: string, status: "verified" | "rejected") {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) {
        const updatedQueue = queue.map((u) =>
          u.id === userId ? { ...u, verification_status: status } : u,
        );
        setQueue(updatedQueue);
        setSelectedUser(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  const getTabUsers = (tab: string) => {
    return queue.filter((u) => {
      if (tab === "pending")
        return (
          u.verification_status === "pending_review" ||
          u.verification_status === "unverified"
        );
      if (tab === "rejected") return u.verification_status === "rejected";
      if (tab === "verified") return u.verification_status === "verified";
      return false;
    });
  };

  const filterAndPaginate = (data: QueuedUser[]) => {
    const filtered = data.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.nik.includes(search);
      const userProvince = getProvinceFromCity(u.location);
      const matchesProvince =
        activeProvince === "Semua" || userProvince === activeProvince;
      const matchesLocation =
        activeLocation === "Semua" || u.location === activeLocation;
      return matchesSearch && matchesProvince && matchesLocation;
    });
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
    return { paginated, totalPages, totalCount: filtered.length };
  };

  const pendingResult = filterAndPaginate(getTabUsers("pending"));
  const verifiedResult = filterAndPaginate(getTabUsers("verified"));
  const rejectedResult = filterAndPaginate(getTabUsers("rejected"));

  const StatusBadge = ({ status }: { status: string }) => {
    const isPending = status === "pending_review" || status === "unverified";
    const isVerified = status === "verified";
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border",
          isPending && "bg-amber-50 text-amber-600 border-amber-200",
          isVerified && "bg-blue-50 text-blue-600 border-blue-200",
          status === "rejected" && "bg-rose-50 text-rose-600 border-rose-200",
        )}
      >
        {isPending && <Clock className="size-3" />}
        {isVerified && <CheckCircle2 className="size-3" />}
        {status === "rejected" && <XCircle className="size-3" />}
        {VERIFICATION_STATUS_MAPPING[status] || status}
      </span>
    );
  };

  const QueueTable = ({ data }: { data: QueuedUser[] }) => (
    <div className="rounded-xl border border-blue-100 bg-white overflow-hidden shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-blue-50/60 border-b border-blue-100">
          <tr>
            <th className="p-4 font-bold text-xs uppercase tracking-wider text-blue-900/60">
              Identitas
            </th>
            <th className="p-4 font-bold text-xs uppercase tracking-wider text-blue-900/60">
              Detail Info
            </th>
            <th className="p-4 font-bold text-xs uppercase tracking-wider text-blue-900/60">
              Status
            </th>
            <th className="p-4 font-bold text-xs uppercase tracking-wider text-blue-900/60">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-50">
          {data.map((user) => (
            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
              <td className="p-4">
                <p className="font-bold text-[#1A1F2B] line-clamp-1">
                  {user.full_name}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                  <IdCard className="size-3 opacity-70" /> {user.nik}
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Calendar className="size-3.5 opacity-70" />
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit border border-blue-100">
                    <MapPin className="size-3 opacity-70" /> {user.location}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <StatusBadge status={user.verification_status} />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                    className="h-9 px-3 gap-2 border-blue-200 hover:bg-blue-50 text-blue-700"
                  >
                    <Eye className="size-4" />
                    <span className="hidden sm:inline">Tinjau</span>
                  </Button>
                  {(user.verification_status === "pending_review" ||
                    user.verification_status === "unverified") && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(user.id, "verified")}
                        disabled={!!actionLoading}
                        className="h-9 px-3 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <UserCheck className="size-3.5" />
                        )}
                        <span className="hidden sm:inline">Verifikasi</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(user.id, "rejected")}
                        disabled={!!actionLoading}
                        className="h-9 px-3 gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <UserX className="size-3.5" />
                        )}
                        <span className="hidden sm:inline">Tolak</span>
                      </Button>
                    </>
                  )}
                  {user.verification_status === "rejected" && (
                    <Button
                      size="sm"
                      onClick={() => handleVerify(user.id, "verified")}
                      disabled={!!actionLoading}
                      className="h-9 px-3 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {actionLoading === user.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="size-3.5" />
                      )}
                      <span className="hidden sm:inline">Setujui Ulang</span>
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="p-12 text-center text-slate-400 italic"
              >
                <div className="flex flex-col items-center gap-2">
                  <Inbox className="size-8 opacity-20" />
                  <p>Belum ada data untuk kategori ini.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const PaginationControls = ({ totalPages }: { totalPages: number }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-slate-500 font-medium">
          Halaman {currentPage} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 rounded-lg border-blue-200"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 rounded-lg border-blue-200"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-12 pt-8 sm:px-8">
      <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="font-heading text-4xl font-black tracking-tight text-slate-900">
            Verification Queue
          </h1>
        </div>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
          Tinjau dan verifikasi identitas warga. Pastikan dokumen yang diajukan
          valid sebelum memberikan akses.
        </p>
      </section>

      <Tabs
        defaultValue="pending"
        onValueChange={() => {
          setSearch("");
          setCurrentPage(1);
        }}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <TabsList className="grid w-full sm:w-[500px] grid-cols-3 p-1 bg-blue-50 rounded-xl border border-blue-100">
            <TabsTrigger
              value="pending"
              className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <Clock className="size-4" /> Antrian (
              {getTabUsers("pending").length})
            </TabsTrigger>
            <TabsTrigger
              value="verified"
              className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <CheckCircle2 className="size-4" /> Terverifikasi (
              {getTabUsers("verified").length})
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <XCircle className="size-4" /> Ditolak (
              {getTabUsers("rejected").length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIK..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
              />
            </div>
            <select
              value={activeProvince}
              onChange={(e) => {
                setActiveProvince(e.target.value);
                setActiveLocation("Semua");
                setCurrentPage(1);
              }}
              className="h-[42px] px-3 rounded-xl border border-blue-200 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer text-slate-600"
            >
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={activeLocation}
              onChange={(e) => {
                setActiveLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[42px] px-3 rounded-xl border border-blue-200 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer text-slate-600"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-700">
              Antrian Verifikasi
            </h2>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {pendingResult.totalCount} Warga
            </Badge>
          </div>
          <QueueTable data={pendingResult.paginated} />
          <PaginationControls totalPages={pendingResult.totalPages} />
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-700">
              Warga Terverifikasi
            </h2>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {verifiedResult.totalCount} Warga
            </Badge>
          </div>
          <QueueTable data={verifiedResult.paginated} />
          <PaginationControls totalPages={verifiedResult.totalPages} />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-700">Warga Ditolak</h2>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {rejectedResult.totalCount} Warga
            </Badge>
          </div>
          <QueueTable data={rejectedResult.paginated} />
          <PaginationControls totalPages={rejectedResult.totalPages} />
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 bg-white border-b border-blue-100 px-8 py-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedUser.full_name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedUser.email} • ID: {selectedUser.id.slice(0, 8)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedUser.verification_status} />
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="size-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <X className="size-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 grid gap-8 lg:grid-cols-[1fr_300px]">
                {/* Document */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-blue-900/60 uppercase tracking-wider">
                    Dokumen Identitas
                  </h3>
                  <div
                    onClick={() => setIsImageModalOpen(true)}
                    className="relative aspect-[1.58/1] rounded-2xl border-2 border-blue-100 bg-slate-100 overflow-hidden group cursor-zoom-in"
                  >
                    <Image
                      src={selectedUser.card_url}
                      alt="Citizen Card"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-blue-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                      <Eye className="size-8 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Lihat Full
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <AlertCircle className="size-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Pengecekan Protokol
                      </span>
                    </div>
                    <p className="text-sm text-blue-900/70 leading-relaxed">
                      Pastikan NIK{" "}
                      <span className="font-bold text-blue-800 underline underline-offset-4 decoration-blue-400">
                        {selectedUser.nik}
                      </span>{" "}
                      sesuai dengan nomor pada dokumen. Periksa adanya
                      manipulasi atau kualitas gambar rendah.
                    </p>
                  </div>
                </div>

                {/* User Data */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-blue-900/60 uppercase tracking-wider">
                    Data Pengguna
                  </h3>
                  <div className="rounded-xl border border-blue-100 bg-white p-5 space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <User className="size-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Nama
                        </p>
                        <p className="text-sm font-semibold text-[#1A1F2B]">
                          {selectedUser.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <IdCard className="size-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          NIK
                        </p>
                        <p className="text-sm font-semibold text-[#1A1F2B] font-mono">
                          {selectedUser.nik}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <MapPin className="size-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Wilayah
                        </p>
                        <p className="text-sm font-semibold text-[#1A1F2B]">
                          {selectedUser.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Calendar className="size-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Terdaftar
                        </p>
                        <p className="text-sm font-semibold text-[#1A1F2B]">
                          {new Date(selectedUser.created_at).toLocaleString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedUser.verification_status !== "verified" && (
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        onClick={() =>
                          handleVerify(selectedUser.id, "verified")
                        }
                        disabled={!!actionLoading}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
                      >
                        {actionLoading === selectedUser.id ? (
                          <Loader2 className="animate-spin mr-2" />
                        ) : (
                          <UserCheck className="mr-2 size-4" />
                        )}
                        {selectedUser.verification_status === "rejected"
                          ? "Setujui Ulang Warga"
                          : "Verifikasi Warga"}
                      </Button>
                      {(selectedUser.verification_status === "pending_review" ||
                        selectedUser.verification_status === "unverified") && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleVerify(selectedUser.id, "rejected")
                          }
                          disabled={!!actionLoading}
                          className="w-full h-11 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
                        >
                          {actionLoading === selectedUser.id ? (
                            <Loader2 className="animate-spin mr-2" />
                          ) : (
                            <UserX className="mr-2 size-4" />
                          )}
                          Tolak Akses
                        </Button>
                      )}
                    </div>
                  )}
                  {selectedUser.verification_status === "verified" && (
                    <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-sm">
                      <CheckCircle2 className="size-5" /> Terverifikasi
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImageModalOpen(false)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl aspect-[1.58/1] bg-white rounded-2xl overflow-hidden shadow-2xl z-10 border-4 border-white"
            >
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 size-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors z-20"
              >
                <X className="size-5" />
              </button>
              <Image
                src={selectedUser.card_url}
                alt="Full size card"
                fill
                className="object-contain"
                unoptimized
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                <p className="text-white font-bold text-lg">
                  {selectedUser.full_name}
                </p>
                <p className="text-white/70 text-sm font-mono">
                  {selectedUser.nik}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
