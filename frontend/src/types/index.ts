export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export type PaymentMethod =
  | "cash"
  | "card"
  | "upi"
  | "bank"
  | "other";

export interface Expense {
  id: number;
  title: string;
  amount: string;
  description: string;
  payment_method: PaymentMethod;
  expense_date: string;
  category: number | null;
  category_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface CategoryExpense {
  category_id: number | null;
  category_name: string;
  total: string;
  transactions: number;
}

export interface ExpenseTrend {
  date: string;
  total: string;
}

export interface RecentTransaction {
  id: number;
  title: string;
  amount: string;
  type: "income" | "expense";
  payment_method: PaymentMethod | null;
  income_type: string | null;
  date: string;
  category: string | null;
}

export interface DashboardData {
  total_expense: string;
  total_income: string;

  monthly_expense: string;
  monthly_income: string;
  monthly_savings: string;

  savings_rate: string | number | null;

  total_transactions: number;
  average_transaction: string;

  income_set: boolean;

  category_expenses: CategoryExpense[];

  expense_trend: ExpenseTrend[];

  recent_transactions: RecentTransaction[];
}