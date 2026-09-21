import client from "./client";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryExpenseCreatePayload,
  CategoryMedicationCreatePayload,
  Expense,
  Medication,
} from "../types";

export const getCategories = async (): Promise<Category[]> => {
  const res = await client.get<Category[]>("/categories/");
  return res.data;
};

export const getCategory = async (id: number): Promise<Category> => {
  const res = await client.get<Category>(`/categories/${id}`);
  return res.data;
};

export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<Category> => {
  const res = await client.post<Category>("/categories/", payload);
  return res.data;
};

export const updateCategory = async (
  id: number,
  payload: UpdateCategoryPayload
): Promise<Category> => {
  const res = await client.patch<Category>(`/categories/${id}`, payload);
  return res.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await client.delete(`/categories/${id}`);
};

export const createCategoryExpense = async (
  categoryId: number,
  payload: CategoryExpenseCreatePayload
): Promise<Expense> => {
  const res = await client.post<Expense>(
    `/categories/${categoryId}/expenses`,
    payload
  );
  return res.data;
};

export const createCategoryMedication = async (
  categoryId: number,
  payload: CategoryMedicationCreatePayload
): Promise<Medication> => {
  const res = await client.post<Medication>(
    `/categories/${categoryId}/medications`,
    payload
  );
  return res.data;
};

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategoryExpense,
  createCategoryMedication,
};
