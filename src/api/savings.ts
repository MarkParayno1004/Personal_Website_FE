import client, { getAllPages } from "./client";
import type {
  Saving,
  CreateSavingPayload,
  UpdateSavingPayload,
} from "../types";

export interface GetSavingsOptions {
  standaloneOnly?: boolean;
  expenseId?: number;
}

export const getSavings = async (
  options?: GetSavingsOptions | boolean
): Promise<Saving[]> => {
  // Support both boolean (for standaloneOnly backwards/simple compatibility) and options object
  const opts: GetSavingsOptions =
    typeof options === "boolean" ? { standaloneOnly: options } : options || {};

  let data = await getAllPages<Saving>("/savings/");

  // The API has no filters for these; filter client-side
  if (opts.standaloneOnly) {
    data = data.filter(
      (s) => s.expense_id === null || s.expense_id === undefined
    );
  } else if (opts.expenseId !== undefined) {
    data = data.filter((s) => s.expense_id === opts.expenseId);
  }

  return data;
};

export const getSaving = async (id: number): Promise<Saving> => {
  const res = await client.get<Saving>(`/savings/${id}`);
  return res.data;
};

export const createSaving = async (
  payload: CreateSavingPayload
): Promise<Saving> => {
  const res = await client.post<Saving>("/savings/", payload);
  return res.data;
};

export const updateSaving = async (
  id: number,
  payload: UpdateSavingPayload | Partial<Saving>
): Promise<Saving> => {
  try {
    const res = await client.patch<Saving>(`/savings/${id}`, payload);
    return res.data;
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number } };
    if (axiosError?.response?.status === 405) {
      const res = await client.put<Saving>(`/savings/${id}`, payload);
      return res.data;
    }
    throw err;
  }
};

export const linkSaving = async (
  id: number,
  expenseId: number | null
): Promise<Saving> => {
  return updateSaving(id, { expense_id: expenseId });
};

export const unlinkSaving = async (id: number): Promise<Saving> => {
  return updateSaving(id, { expense_id: null });
};

export const deleteSaving = async (id: number): Promise<void> => {
  await client.delete(`/savings/${id}`);
};

export default {
  getSavings,
  getSaving,
  createSaving,
  updateSaving,
  linkSaving,
  unlinkSaving,
  deleteSaving,
};
