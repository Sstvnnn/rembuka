"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
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
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import Link from "next/link";
import { createProposalAction } from "@/app/actions/musrenbang";
import Image from "next/image";

const categories = ["Infrastructure", "Education", "Health", "Environment", "Social", "Safety"];

const INDONESIA_LOCATIONS: Record<string, string[]> = {
  "Banten": ["Tangerang Selatan", "Kota Tangerang", "Serang", "Cilegon"],
  "DK Jakarta": ["Jakarta Selatan", "Jakarta Pusat", "Jakarta Timur", "Jakarta Barat", "Jakarta Utara"],
  "Jawa Barat": ["Bandung", "Bogor", "Bekasi", "Depok"],
  "Jawa Tengah": ["Semarang", "Surakarta", "Magelang", "Salatiga"]
};

interface ProposalFormProps {
  defaultLocation: string;
}

export function ProposalForm({ defaultLocation }: ProposalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initialProvince = useMemo(() => {
    for (const [province, cities] of Object.entries(INDONESIA_LOCATIONS)) {
      if (cities.includes(defaultLocation)) return province;
    }
    return Object.keys(INDONESIA_LOCATIONS)[0]; 
  }, [defaultLocation]);

  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Infrastructure",
    location: defaultLocation || INDONESIA_LOCATIONS[initialProvince][0],
    estimated_cost: 0
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    const firstCity = INDONESIA_LOCATIONS[province][0];
    setFormData(prev => ({ ...prev, location: firstCity }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      setError("Maximum 4 images allowed.");
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);
    setPreviews(newImages.map(file => URL.createObjectURL(file)));
    setError("");
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages.map(file => URL.createObjectURL(file)));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description || !formData.location) {
      setError("Please fill in all required fields.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("location", formData.location);
    data.append("estimated_cost", formData.estimated_cost.toString());
    images.forEach(img => data.append("images", img));

    startTransition(async () => {
      try {
        await createProposalAction(data);
        setSuccess("Proposal submitted! Redirecting...");
        setTimeout(() => router.push("/proposals"), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" className="rounded-xl text-slate-500 hover:text-slate-800">
          <Link href="/proposals" className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> Back to Proposals
          </Link>
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/40 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-4 border-b border-slate-100 bg-slate-50/50 p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#3F5C73] text-white shadow-xl shadow-[#3F5C73]/20">
                <FileText className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4FB3B3]">Digital Musrenbang</p>
                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">New Proposal</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Province</Label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={selectedProvince}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 text-sm focus:bg-white appearance-none transition-all"
                    >
                      {Object.keys(INDONESIA_LOCATIONS).map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">City / District</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 text-sm focus:bg-white appearance-none transition-all"
                    >
                      {INDONESIA_LOCATIONS[selectedProvince].map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Category</Label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white/50 pl-11 pr-4 text-sm focus:bg-white appearance-none transition-all"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Est. Cost (Rp)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="number"
                      value={formData.estimated_cost || ""}
                      onChange={(e) => setFormData({ ...formData, estimated_cost: Number(e.target.value) })}
                      placeholder="Enter budget"
                      className="h-12 rounded-2xl border-slate-200 bg-white/50 pl-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Proposal Title</Label>
                <div className="relative">
                  <LayoutDashboard className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Solar Powered Street Lights"
                    className="h-12 rounded-2xl border-slate-200 bg-white/50 pl-11 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Documentation (1-4 Photos)</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                      <Image src={url} alt="preview" fill className="object-cover" unoptimized />
                      <button 
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 size-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 cursor-pointer hover:border-[#4FB3B3] hover:bg-white transition-all">
                      <Upload className="size-5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-2">Add Photo</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Description</Label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the community benefit..."
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 p-4 text-sm focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-600">
                    <AlertCircle className="size-4" /> {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="size-4" /> {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button disabled={isPending} className="h-14 w-full rounded-2xl bg-[#3F5C73] text-base font-bold text-white shadow-xl hover:bg-[#314b60]">
                {isPending ? <LoadingSpinner className="mr-2" /> : "Submit Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
