import { getBudgetItems, getUserTaxProfile } from "@/lib/budget";
import { getCurrentProfile } from "@/lib/profile";
import { BudgetVisualizer } from "@/components/budget/budget-visualizer";

export default async function BudgetPage() {
  const { user } = await getCurrentProfile();
  const budgetItems = await getBudgetItems();
  const taxProfile = await getUserTaxProfile(user.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 pt-32 pb-12 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4FB3B3]">Transparency Dashboard</p>
          <h1 className="font-heading text-4xl font-black text-slate-800 tracking-tight">Budget Visualizer</h1>
          <p className="max-w-xl text-sm font-medium text-slate-500">
            Understand how your tax contributions fuel local development. Explore regional spending across Infrastructure, Education, Health, and more.
          </p>
        </div>

        <BudgetVisualizer 
          budgetItems={budgetItems} 
          initialTaxProfile={taxProfile} 
        />
      </div>
    </main>
  );
}
