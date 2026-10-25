import type { Expense } from "./index";

export interface SavingItem {
  id?: number;
  description: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface Saving {
  id: number;
  title: string;
  expense_id?: number | null;
  expense?: Partial<Expense> | null;
  expense_title?: string;
  items?: SavingItem[];
  total_amount?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

export interface CreateSavingPayload {
  title: string;
  expense_id?: number | null;
  items?: Array<{
    description: string;
    amount: number;
  }>;
}

export interface UpdateSavingPayload {
  title?: string;
  expense_id?: number | null;
  items?: Array<{
    id?: number;
    description: string;
    amount: number;
  }>;
}

export interface LinkSavingPayload {
  expense_id: number | null;
}

export type SavingsFilterMode = "all" | "standalone" | "linked";
