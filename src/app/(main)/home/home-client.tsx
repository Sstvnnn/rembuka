"use client";

import Link from "next/link";
import { 
  MapPin, 
  ShieldCheck, 
  UserRound, 
  Vote, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  LucideIcon
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
}

function StatCard({ label, value, icon: Icon, colorClass }: StatCardProps) {
  return (
    <motion.div 
      variants={itemVariants}
      className="flex flex-col gap-2 rounded-3xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-md"
    >
      <div className={cn("flex size-10 items-center justify-center rounded-2xl", colorClass)}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </motion.div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

function ActionCard({ title, description, icon: Icon, href, color }: ActionCardProps) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/40 p-8 shadow-lg backdrop-blur-xl transition-all hover:shadow-2xl hover:bg-white/60"
    >
      <div className={cn("mb-6 flex size-14 items-center justify-center rounded-[1.5rem] transition-transform group-hover:scale-110 group-hover:rotate-3", color)}>
        <Icon className="size-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
      <Link href={href} className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:gap-3 transition-all">
        Explore now <ArrowRight className="size-4" />
      </Link>
    </motion.div>
  );
}

interface HomeClientProps {
  user: {
    user_metadata: {
      full_name?: string;
      nik?: string;
      location?: string;
    };
  };
  profile: {
    full_name?: string;
    nik?: string;
    location?: string;
    verification_status?: string;
    role?: string;
  } | null;
  userType?: string;
  role?: string;
}

export function HomeClient({ user, profile, userType = "citizen", role = "citizen" }: HomeClientProps) {
  const isGovernance = userType === "governance";
  const typedProfile = profile as {
    full_name?: string;
    location?: string;
    verification_status?: string;
    nik?: string;
  } | null;
  const fullName = typedProfile?.full_name ?? user.user_metadata.full_name ?? (isGovernance ? "Official" : "Citizen");
  const nik = typedProfile?.nik ?? user.user_metadata.nik ?? "-";
  const location = typedProfile?.location ?? user.user_metadata.location ?? "Unknown";
  const isVerified = isGovernance || typedProfile?.verification_status === "verified";
  const currentRole = isGovernance ? role : "Citizen";

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(242,92,122,0.1),transparent_50%),#f8fafc] px-4 pt-32 pb-12 sm:px-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto max-w-7xl space-y-8"
      >
        {/* Hero Section */}
        <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <motion.div 
            variants={itemVariants}
            className={cn(
              "group relative overflow-hidden rounded-[3rem] border border-white/20 p-10 text-white shadow-2xl transition-all",
              isGovernance ? "bg-slate-800" : "bg-[#3F5C73]"
            )}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                <ShieldCheck className={cn("size-3", isGovernance ? "text-amber-400" : "text-[#4FB3B3]")} />
                {isGovernance ? `${currentRole} Account` : (isVerified ? "Verified Identity" : "Awaiting Verification")}
              </div>
              <h2 className="mt-8 font-heading text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {isGovernance ? "Governance" : "Empowering"} <br />
                <span className={cn(isGovernance ? "text-amber-400" : "text-[#4FB3B3]")}>{isGovernance ? "Management" : "Civic"}</span> {isGovernance ? "Portal" : "Voices"}.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                Welcome back, <span className="text-white font-bold">{fullName}</span>. 
                {isGovernance 
                  ? ` Access authorized for regional governance in ${location}. Manage proposals and review civic participation.`
                  : ` Your ${isVerified ? "verified" : "registered"} account grants you access to Rembuka's digital governance platform.`}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button asChild size="lg" className={cn(
                  "rounded-2xl font-bold text-slate-900 shadow-xl",
                  isGovernance 
                    ? "bg-amber-400 hover:bg-amber-500 shadow-amber-400/20" 
                    : "bg-[#4FB3B3] hover:bg-[#3da3a3] shadow-[#4FB3B3]/20"
                )}>
                  <Link href={isGovernance ? "/admin/queue" : "/proposals"}>
                    {isGovernance ? "Review Queue" : "Browse Proposals"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/20 bg-white/5 font-bold text-white backdrop-blur-md hover:bg-white/10">
                  <Link href="/profile">My Identity</Link>
                </Button>
              </div>
            </div>
            
            {/* Background elements */}
            <div className={cn(
              "absolute -right-20 -top-20 size-80 rounded-full blur-3xl group-hover:scale-110 transition-all duration-700",
              isGovernance ? "bg-amber-400/10 group-hover:bg-amber-400/20" : "bg-[#4FB3B3]/10 group-hover:bg-[#4FB3B3]/20"
            )} />
            <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-rose-500/10 blur-3xl" />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              label={isGovernance ? "Official Role" : "User ID"} 
              value={isGovernance ? currentRole : (nik.slice(0, 8) + "...")} 
              icon={isGovernance ? ShieldCheck : UserRound} 
              colorClass={isGovernance ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-500"} 
            />
            <StatCard label="Location" value={location} icon={MapPin} colorClass="bg-rose-50 text-rose-500" />
            <StatCard 
              label="Account Status" 
              value={isGovernance ? "Authorized" : (isVerified ? "Verified" : "Pending")} 
              icon={ShieldCheck} 
              colorClass="bg-emerald-50 text-emerald-500" 
            />
            <StatCard label="System Load" value="Optimal" icon={TrendingUp} colorClass="bg-indigo-50 text-indigo-500" />
            
            <motion.div 
              variants={itemVariants}
              className="col-span-2 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "size-12 rounded-2xl flex items-center justify-center text-white",
                  isGovernance ? "bg-slate-700" : "bg-slate-800"
                )}>
                  <MessageSquare className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{isGovernance ? "System Alerts" : "New Discussions"}</p>
                  <p className="text-xs text-slate-500">
                    {isGovernance ? "0 critical issues pending" : "12 active in your region"}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-5 text-slate-400" />
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          <ActionCard 
            title={isGovernance ? "Queue Management" : "Policy Voting"} 
            description={isGovernance 
              ? "Review and process incoming citizen identity verification requests."
              : "Cast your verified vote on upcoming regional policies and influence community development."}
            icon={isGovernance ? ShieldCheck : Vote}
            href={isGovernance ? "/admin/queue" : "/voting"}
            color={isGovernance ? "bg-slate-700" : "bg-indigo-500"}
          />
          <ActionCard 
            title={isGovernance ? "Proposal Oversight" : "Public Proposals"} 
            description={isGovernance
              ? "Monitor and moderate community proposals submitted by verified citizens."
              : "Submit and browse structured infrastructure and social development proposals."}
            icon={MapPin}
            href="/proposals"
            color="bg-emerald-500"
          />
          <ActionCard 
            title={isGovernance ? "Network Analytics" : "Regional Analytics"} 
            description={isGovernance
              ? "Access comprehensive participation data and system-wide growth metrics."
              : "Visualize participation data and development progress across your local district."}
            icon={TrendingUp}
            href="/analytics"
            color="bg-amber-500"
          />
        </section>

        {/* Footer */}
        <motion.footer variants={itemVariants} className="pt-12 pb-6 flex flex-col items-center justify-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Rembuka {isGovernance ? "Governance" : "Civic"} Network &copy; 2024</p>
          <div className="h-[1px] w-12 bg-slate-200" />
        </motion.footer>
      </motion.div>
    </main>
  );
}
