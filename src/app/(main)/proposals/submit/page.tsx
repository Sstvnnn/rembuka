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
  const isVerified =
    isCitizen &&
    (profile as { verification_status?: string } | null)
      ?.verification_status === "verified";

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 pb-20 pt-35 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Halaman yang Bersih */}
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Ajukan Proposal Pembangunan
          </h1>
          <p className="max-w-2xl text-base text-slate-500">
            Sampaikan aspirasi dan usulan pembangunan untuk memajukan
            infrastruktur dan pelayanan di wilayah Anda.
          </p>
        </section>

        {/* Kontainer Form */}
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
