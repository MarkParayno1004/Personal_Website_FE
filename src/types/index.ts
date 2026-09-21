import type { ComponentType } from 'react';

export interface User {
  id?: number | string;
  email: string;
  first_name: string;
  last_name?: string;
  admin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

export interface SkillCategory {
  category: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  items: string[];
}

export interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  degree: string;
  specialization: string;
  school: string;
  year: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
}

export interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stars?: number;
  stargazers_count?: number;
  forks?: number;
  forks_count?: number;
}

export interface PortfolioProfile {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface PortfolioConfig {
  id?: number;
  full_name?: string;
  name?: string;
  headline?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  linkedin?: string;
  github_username?: string;
  github?: string;
  about_summary?: string;
  summary?: string;
  skills?: SkillCategory[] | Record<string, string[]>;
  experience?: Array<{
    role?: string;
    title?: string;
    company?: string;
    period?: string;
    current?: boolean;
    bullets?: string[];
  }>;
  education?: Array<{
    degree?: string;
    specialization?: string;
    institution?: string;
    school?: string;
    graduation_date?: string;
    year?: string;
    icon?: ComponentType<{ size?: number; className?: string }>;
  }>;
}

export interface DashboardStats {
  total_users: number;
  total_expenses: number;
  total_medications: number;
  total_expense_amount: number;
}

export interface ExpenseItem {
  id?: number;
  description: string;
  amount: number;
}

export interface TaxDeduction {
  id?: number;
  description: string;
  amount: number;
}

export interface Expense {
  id: number;
  title: string;
  gross_income: number;
  net_income?: number;
  total_tax_deductions?: number;
  total_expenses?: number;
  total_amount?: number;
  remaining_income?: number;
  category_id?: number | null;
  items?: ExpenseItem[];
  tax_deductions?: TaxDeduction[];
  created_at?: string;
}

export type ExpenseSheet = Expense;

export interface Medication {
  id: number;
  name: string;
  cost: number;
  doses_taken: number;
  total_spent?: number;
  category_id?: number | null;
  created_at?: string;
}

export interface Category {
  id: number;
  title: string;
  user_id: number;
  expenses: Expense[];
  medications: Medication[];
  total_expenses_amount: number;
  total_medications_amount: number;
  total_amount: number;
  created_at: string;
}

export interface CreateCategoryPayload {
  title: string;
  expenses?: Array<{
    title: string;
    gross_income?: number;
    net_income?: number;
    items?: Array<{ description: string; amount: number }>;
    tax_deductions?: Array<{ description: string; amount: number }>;
  }>;
  medications?: Array<{
    name: string;
    cost: number;
    doses_taken?: number;
  }>;
}

export interface UpdateCategoryPayload {
  title?: string;
}

export interface CategoryExpenseCreatePayload {
  title: string;
  gross_income?: number;
  items?: Array<{ description: string; amount: number }>;
  tax_deductions?: Array<{ description: string; amount: number }>;
}

export interface CategoryMedicationCreatePayload {
  name: string;
  cost: number;
  doses_taken?: number;
}

export interface AdminUser {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  admin: boolean;
}

