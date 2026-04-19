/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProposals, getProposalVotes } from "@/lib/proposals";
import { getCurrentProfile } from "@/lib/profile";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalList } from "@/components/proposals/proposal-list";
import { Proposal } from "@/types/musrenbang";

export default async function ProposalsPage() {
  let user: any = null;
  let userType: string = "citizen";
  let proposals: Proposal[] = [];
  let userVotes: any[] = [];
  let errorOccurred = false;

  try {
    const profileData = await getCurrentProfile();
    user = profileData.user;
    userType = profileData.userType;

    // Fetch data - error handling is inside the lib functions already (returning [])
    const [fetchedProposals, fetchedVotes] = await Promise.all([
      getProposals(),
      getProposalVotes(user.id)
    ]);

    proposals = fetchedProposals;
    userVotes = fetchedVotes;
  } catch (err) {
    console.error("ProposalsPage data fetch error:", err);
    errorOccurred = true;
  }

  if (errorOccurred || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="size-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle className="size-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Error</h2>
            <p className="text-sm text-slate-500 font-medium">
              We encountered a problem loading the Musrenbang dashboard. Please try again later.
            </p>
          </div>
          <Button asChild className="w-full h-12 rounded-2xl bg-slate-800 font-bold text-white hover:bg-slate-700">
            <Link href="/home">Return Home</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 pt-32 pb-12 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4FB3B3]">Digital Musrenbang</p>
            <h1 className="font-heading text-4xl font-black text-slate-800 tracking-tight">Citizen Proposals</h1>
            <p className="max-w-xl text-sm font-medium text-slate-500">
              Voice your community needs. Browse, vote, and track local development projects proposed by fellow citizens.
            </p>
          </div>
          
          <Button asChild className="rounded-2xl bg-[#3F5C73] font-bold text-white shadow-xl shadow-[#3F5C73]/20 hover:bg-[#314b60]">
            <Link href="/proposals/submit" className="flex items-center gap-2">
              <Plus className="size-4" /> Submit Proposal
            </Link>
          </Button>
        </div>

        <ProposalList 
          initialProposals={proposals} 
          userVotes={userVotes} 
          userType={userType}
          currentUserId={user.id}
        />
      </div>
    </main>
  );
}
