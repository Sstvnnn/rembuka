import { ProposalForm } from "@/components/proposals/proposal-form";
import { getCurrentProfile } from "@/lib/profile";

export default async function SubmitProposalPage() {
  const { profile, userType } = await getCurrentProfile();
  const defaultLocation = profile?.location || "";
  
  // Governance is always considered verified for proposal submission logic 
  // or we only allow citizens. For now, check if citizen is verified.
  const isVerified = userType === "governance" || (profile as any)?.verification_status === "verified";

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 pt-32 pb-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4FB3B3]">Empower your community</p>
          <h1 className="font-heading text-4xl font-black text-slate-800 tracking-tight">Citizen Report</h1>
        </div>
        
        <ProposalForm defaultLocation={defaultLocation} isVerified={isVerified} />
      </div>
    </main>
  );
}
