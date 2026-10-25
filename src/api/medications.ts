import client, { getAllPages } from "./client";
import type { Medication } from "../types";

export const getMedications = async (uncategorizedOnly = false): Promise<Medication[]> => {
  const data = await getAllPages<Medication>("/medications/");
  if (uncategorizedOnly) {
    return data.filter((m) => m.category_id === null || m.category_id === undefined);
  }
  return data;
};

export const getMedication = async (id: number): Promise<Medication> => {
  const res = await client.get<Medication>(`/medications/${id}`);
  return res.data;
};

export const createMedication = async (
  payload: Partial<Medication>
): Promise<Medication> => {
  const res = await client.post<Medication>("/medications/", payload);
  return res.data;
};

export const updateMedication = async (
  id: number,
  payload: Partial<Medication>
): Promise<Medication> => {
  try {
    const res = await client.patch<Medication>(`/medications/${id}`, payload);
    return res.data;
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number } };
    if (axiosError?.response?.status === 405) {
      const res = await client.put<Medication>(`/medications/${id}`, payload);
      return res.data;
    }
    throw err;
  }
};

export const takeMedicationDose = async (
  id: number,
  doses = 1
): Promise<Medication> => {
  const res = await client.post<Medication>(`/medications/${id}/take`, { doses });
  return res.data;
};

export const deleteMedication = async (id: number): Promise<void> => {
  await client.delete(`/medications/${id}`);
};

export default {
  getMedications,
  getMedication,
  createMedication,
  updateMedication,
  takeMedicationDose,
  deleteMedication,
};
