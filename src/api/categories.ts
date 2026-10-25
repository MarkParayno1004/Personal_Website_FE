import client, { getAllPages } from "./client";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  LinkItemsPayload,
  UnlinkItemsPayload,
  CategoryExpenseCreatePayload,
  CategoryMedicationCreatePayload,
  Expense,
  Medication,
} from "../types";

export const getCategories = async (): Promise<Category[]> => {
  return getAllPages<Category>("/categories/");
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

/**
 * Bulk link uncategorized expenses and/or medications to a category.
 * Calls POST /categories/:id/link (with fallback to /import if required).
 */
export const linkCategoryItems = async (
  categoryId: number,
  payload: LinkItemsPayload
): Promise<Category> => {
  try {
    const res = await client.post<Category>(
      `/categories/${categoryId}/link`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number } };
    if (axiosError?.response?.status === 404) {
      const res = await client.post<Category>(
        `/categories/${categoryId}/import`,
        payload
      );
      return res.data;
    }
    throw err;
  }
};

/**
 * Bulk unlink expenses and/or medications from a category back to uncategorized (category_id: null).
 * Calls POST /categories/:id/unlink.
 */
export const unlinkCategoryItems = async (
  categoryId: number,
  payload: UnlinkItemsPayload
): Promise<Category> => {
  const res = await client.post<Category>(
    `/categories/${categoryId}/unlink`,
    payload
  );
  return res.data;
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
  linkCategoryItems,
  unlinkCategoryItems,
  createCategoryExpense,
  createCategoryMedication,
};
