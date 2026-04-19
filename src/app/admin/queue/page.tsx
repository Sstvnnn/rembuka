"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  ExternalLink, 
  Clock, 
  User, 
  MapPin, 
  IdCard,
  Search,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  History
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function AdminQueuePage() {
  const [queue, setQueue] = useState<QueuedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<QueuedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "rejected">("pending");

  async function fetchQueue() {
    try {
      const res = await fetch("/api/admin/queue");
      const data = await res.json();
      setQueue(data.queue || []);
      
      const firstPending = data.queue?.find((u: QueuedUser) => u.verification_status === "pending_review");
      if (firstPending && !selectedUser) {
        setSelectedUser(firstPending);
      }
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
        // Refresh local state
        const updatedQueue = queue.map(u => u.id === userId ? { ...u, verification_status: status } : u);
        setQueue(updatedQueue);
        
        // Find next user in current tab
        const nextInTab = updatedQueue.filter(u => 
          status === "verified" 
            ? u.verification_status === "pending_review" 
            : u.verification_status === activeTab
        )[0];
        
        setSelectedUser(nextInTab || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  const tabUsers = queue.filter(u => 
    activeTab === "pending" ? u.verification_status === "pending_review" : u.verification_status === "rejected"
  );

  const filteredQueue = tabUsers.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.nik.includes(search)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="size-12 animate-spin text-[#3F5C73]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] pt-20">
      {/* Sidebar Queue */}
      <aside className="w-[420px] flex flex-col border-r border-slate-200 bg-white shadow-xl z-20">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-[#3F5C73] text-white flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight uppercase">Admin Review</h1>
            </div>
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab("pending")}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  activeTab === "pending" ? "bg-white text-[#3F5C73] shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Queue ({queue.filter(u => u.verification_status === "pending_review").length})
              </button>
              <button 
                onClick={() => setActiveTab("rejected")}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  activeTab === "rejected" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Archive ({queue.filter(u => u.verification_status === "rejected").length})
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search legal identities..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-[#4FB3B3]/20 focus:border-[#4FB3B3]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
              <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                {activeTab === "pending" ? <Inbox className="size-6 opacity-20" /> : <History className="size-6 opacity-20" />}
              </div>
              <p className="font-bold text-[10px] uppercase tracking-widest">{activeTab === "pending" ? "Queue Clear" : "No Rejections"}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredQueue.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    "w-full p-5 text-left transition-all hover:bg-slate-50 group relative",
                    selectedUser?.id === user.id ? "bg-[#4FB3B3]/5 border-l-4 border-l-[#4FB3B3]" : "border-l-4 border-l-transparent"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-slate-800 truncate pr-4">{user.full_name}</p>
                    <time className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <IdCard className="size-3" /> {user.nik}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    {user.verification_status === "pending_review" ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-black uppercase text-amber-600 border border-amber-100">
                        <Clock className="size-2" /> Pending Review
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[8px] font-black uppercase text-rose-600 border border-rose-100">
                        <AlertCircle className="size-2" /> Rejected
                      </span>
                    )}
                  </div>
                  <ChevronRight className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 transition-all",
                    selectedUser?.id === user.id ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0 group-hover:opacity-100"
                  )} />
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 lg:p-12">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key={selectedUser.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedUser.full_name}</h2>
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                      selectedUser.verification_status === "pending_review" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {selectedUser.verification_status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm">{selectedUser.email} • User ID: {selectedUser.id.slice(0,8)}</p>
                </div>

                <div className="flex items-center gap-3">
                  {selectedUser.verification_status === "pending_review" && (
                    <Button 
                      variant="outline"
                      onClick={() => handleVerify(selectedUser.id, "rejected")}
                      disabled={!!actionLoading}
                      className="h-11 rounded-xl border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-6"
                    >
                      {actionLoading === selectedUser.id ? <Loader2 className="animate-spin" /> : <UserX className="mr-2 size-4" />}
                      Reject Access
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleVerify(selectedUser.id, "verified")}
                    disabled={!!actionLoading}
                    className="h-11 rounded-xl bg-[#3F5C73] text-white hover:bg-[#314b60] font-bold px-8 shadow-xl shadow-[#3F5C73]/20"
                  >
                    {actionLoading === selectedUser.id ? <Loader2 className="animate-spin" /> : <UserCheck className="mr-2 size-4" />}
                    {selectedUser.verification_status === "rejected" ? "Re-Approve Citizen" : "Verify Citizen"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted Document</h3>
                    <a href={selectedUser.card_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#4FB3B3] hover:underline flex items-center gap-1">
                      View full size <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <div className="relative aspect-[1.58/1] rounded-[2.5rem] border-[6px] border-white bg-slate-200 shadow-2xl overflow-hidden group">
                    <Image 
                      src={selectedUser.card_url} 
                      alt="Citizen Card" 
                      fill 
                      className="object-cover"
                      unoptimized 
                    />
                  </div>
                  
                  <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-[#4FB3B3] mb-4">
                        <AlertCircle className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol Check</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed opacity-80">
                        Please verify that the NIK <span className="text-white font-black underline underline-offset-4 decoration-[#4FB3B3]">{selectedUser.nik}</span> matches the number visible on the submitted document. Check for tampering or low-quality captures.
                      </p>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] size-40 bg-[#4FB3B3]/10 rounded-full blur-3xl group-hover:bg-[#4FB3B3]/20 transition-all" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[2.5rem] border border-white bg-white/60 p-8 shadow-xl backdrop-blur-md">
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">User Data</h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User className="size-5" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Legal Name</p>
                          <p className="text-sm font-bold text-slate-800">{selectedUser.full_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <MapPin className="size-5" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Region</p>
                          <p className="text-sm font-bold text-slate-800">{selectedUser.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <Clock className="size-5" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Signed Up</p>
                          <p className="text-sm font-bold text-slate-800">{new Date(selectedUser.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Security Status</p>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                      This user has completed email verification. The identity document is the final step for full network participation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="size-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-xl border border-slate-50">
                <Inbox className="size-12 opacity-10" />
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">No active cases</h2>
              <p className="mt-2 text-sm font-medium">Select a user from the {activeTab} list to review.</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
