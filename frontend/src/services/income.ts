import api from "./api";

export type IncomeType =
  | "salary"
  | "freelance"
  | "bonus"
  | "interest"
  | "other";

export interface Income {
  id: number;
  title: string;
  amount: string;
  income_type: IncomeType;
  income_type_display: string;
  description: string;
  income_date: string;
  created_at: string;
  updated_at: string;
}

export interface IncomePayload {
  title: string;
  amount: string;
  income_type: IncomeType;
  description: string;
  income_date: string;
}

export const getIncomes = async (): Promise<Income[]> => {
  const response = await api.get("/income/");
  return response.data;
};

export const createIncome = async (
  data: IncomePayload,
): Promise<Income> => {
  const response = await api.post("/income/", data);
  return response.data;
};

export const updateIncome = async (
  id: number,
  data: IncomePayload,
): Promise<Income> => {
  const response = await api.put(`/income/${id}/`, data);
  return response.data;
};

export const deleteIncome = async (id: number) => {
  await api.delete(`/income/${id}/`);
};