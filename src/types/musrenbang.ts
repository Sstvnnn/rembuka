export type ProposalStatus = "pending" | "approved" | "rejected";

export type Proposal = {
  id: string;
  period_id: string;
  author_id: string;
  author_name?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  image_paths: string[];
  status: ProposalStatus | string;
  estimated_cost: number;
  proposal_start_at?: string;
  proposal_end_at?: string;
  voting_start_at?: string;
  voting_end_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at?: string;
  total_points?: number;
  total_votes?: number;
};

export type ProposalPeriod = {
  id: string;
  location: string;
  proposal_start_at: string;
  proposal_end_at: string;
  voting_start_at: string;
  voting_end_at: string;
  created_at: string;
  updated_at: string;
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
