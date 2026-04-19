import { createClient } from "@/lib/supabase/server";
import { BudgetItem, UserTaxProfile } from "@/types/musrenbang";

export async function getBudgetItems(year: number = 2024) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("fiscal_year", year)
    .eq("is_active", true);

  if (error) throw error;
  return data as BudgetItem[];
}

export async function getUserTaxProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_tax_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserTaxProfile | null;
}
