import { ProposalForm } from "@/components/proposals/proposal-form";
import { getCurrentProfile } from "@/lib/profile";
import { getProposalPhase } from "@/lib/proposal-periods";
import { getRelevantProposalPeriod } from "@/lib/proposals";

export default async function SubmitProposalPage() {
  const { profile, userType, role } = await getCurrentProfile();
  const defaultLocation = profile?.location || "";
  const activePeriod = await getRelevantProposalPeriod(defaultLocation);
  const currentPhase = getProposalPhase(activePeriod);

  const isCitizen = userType === "citizen";
  const isVerified = isCitizen && (profile as { verification_status?: string } | null)?.verification_status === "verified";

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 pb-12 pt-32 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4FB3B3]">Ruang Aspirasi Daerah</p>
          <h1 className="font-heading text-4xl font-black tracking-tight text-slate-800">Kirim Aspirasi Warga</h1>
        </div>

        <ProposalForm
          defaultLocation={defaultLocation}
          isVerified={isVerified}
          canSubmit={isCitizen && role !== "admin"}
          currentPhase={currentPhase}
          activePeriod={activePeriod}
        />
      </div>
    </main>
  );
}
