import api from "./api";

export type ReportPeriod =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year"
  | "custom";

export interface ReportSummary {
  income: string;
  expense: string;
  savings: string;
  savings_rate: string | number | null;
  income_set: boolean;
}

export interface ReportTransactions {
  income: number;
  expense: number;
  total: number;
}

export interface ReportCategory {
  category_id: number | null;
  category_name: string;
  total: string;
  transactions: number;
}

export interface ReportExpenseTrend {
  date: string;
  total: string;
}

export interface ReportMonthlyTrend {
  month: string;
  income: string;
  expense: string;
  savings: string;
}

export interface ReportData {
  period: ReportPeriod;
  start_date: string;
  end_date: string;
  summary: ReportSummary;
  transactions: ReportTransactions;
  categories: ReportCategory[];
  expense_trend: ReportExpenseTrend[];
  monthly_trend: ReportMonthlyTrend[];
}

export const getReport = async (
  period: ReportPeriod,
  startDate?: string,
  endDate?: string,
): Promise<ReportData> => {
  const params: Record<string, string> = {
    period,
  };

  if (period === "custom" && startDate && endDate) {
    params.start_date = startDate;
    params.end_date = endDate;
  }

  const response = await api.get("/reports/", {
    params,
  });

  return response.data;
};