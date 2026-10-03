import api from "./api";
import type { Category, Expense, DashboardData } from "@/types";

export interface ExpensePayload {
  title: string;
  amount: string;
  description: string;
  payment_method: Expense["payment_method"];
  expense_date: string;
  category: number | null;
}

export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get("/expenses/");
  return response.data;
};

export const createExpense = async (
  data: ExpensePayload,
): Promise<Expense> => {
  const response = await api.post("/expenses/", data);
  return response.data;
};

export const updateExpense = async (
  id: number,
  data: ExpensePayload,
): Promise<Expense> => {
  const response = await api.put(`/expenses/${id}/`, data);
  return response.data;
};

export const deleteExpense = async (id: number) => {
  await api.delete(`/expenses/${id}/`);
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/categories/");
  return response.data;
};

export const createCategory = async (name: string): Promise<Category> => {
  const response = await api.post("/categories/", { name });
  return response.data;
};

export const deleteCategory = async (id: number) => {
  await api.delete(`/categories/${id}/`);
};

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await api.get("/dashboard/");
  return response.data;
};