import client, { getAllPages } from "./client";
import type { Expense } from "../types";

export const getExpenses = async (uncategorizedOnly = false): Promise<Expense[]> => {
  const data = await getAllPages<Expense>("/expenses/");
  if (uncategorizedOnly) {
    return data.filter((e) => e.category_id === null || e.category_id === undefined);
  }
  return data;
};

export const getExpense = async (id: number): Promise<Expense> => {
  const res = await client.get<Expense>(`/expenses/${id}`);
  return res.data;
};

export const createExpense = async (payload: Partial<Expense>): Promise<Expense> => {
  const res = await client.post<Expense>("/expenses/", payload);
  return res.data;
};

export const updateExpense = async (
  id: number,
  payload: Partial<Expense>
): Promise<Expense> => {
  // Use PATCH endpoint as per specification, with fallback to PUT if needed
  try {
    const res = await client.patch<Expense>(`/expenses/${id}`, payload);
    return res.data;
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number } };
    if (axiosError?.response?.status === 405) {
      const res = await client.put<Expense>(`/expenses/${id}`, payload);
      return res.data;
    }
    throw err;
  }
};

export const deleteExpense = async (id: number): Promise<void> => {
  await client.delete(`/expenses/${id}`);
};

export default {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
