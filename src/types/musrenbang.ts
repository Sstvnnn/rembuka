export type Proposal = {
  id: string;
  author_id: string;
  author_name?: string; 
  title: string;
  description: string;
  category: string;
  location: string;
  image_paths: string[];
  status: string;
  estimated_cost: number;
  expiry_date?: string;
  created_at: string;
  total_points?: number;
  total_votes?: number;
};

export type BudgetItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string | null;
  fiscal_year: number;
};

export type UserTaxProfile = {
  user_id: string;
  annual_income: number;
  estimated_tax_paid: number;
};
