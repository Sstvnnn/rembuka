import { PolisManagement } from "@/components/governance/polis-management";

export default function GovernancePolisPage() {
  return (
    <main className="min-h-screen bg-[#F6F5F2] px-4 pb-12 pt-32 sm:px-8 text-[#1A1F2B]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#11538C]">
            Governance Workspace
          </p>
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-[#1A1F2B]">
            POL.IS Rules and Briefs
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
            Halaman ini mengelompokkan pekerjaan pemerintah untuk menyiapkan
            materi diskusi publik. Anda dapat membuka dokumen sumber, merapikan
            ringkasan kebijakan, dan memastikan warga menerima konteks yang
            benar sebelum voting dimulai.
          </p>
        </section>

        <PolisManagement />
      </div>
    </main>
  );
}
