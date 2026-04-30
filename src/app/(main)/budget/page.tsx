import { getBudgetItems, getUserTaxProfile } from "@/lib/budget";
import { getCurrentProfile } from "@/lib/profile";
import { BudgetVisualizer } from "@/components/budget/budget-visualizer";

export default async function BudgetPage() {
  const { user } = await getCurrentProfile();
  const budgetItems = await getBudgetItems();
  const taxProfile = await getUserTaxProfile(user.id);

  return (
    <main className="min-h-screen bg-[#F4F6FA] px-4 pb-12 pt-32 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">


        <BudgetVisualizer
          budgetItems={budgetItems}
          initialTaxProfile={taxProfile}
        />
      </div>
    </main>
  );
}
