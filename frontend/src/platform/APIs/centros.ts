import { apiFetch } from "./api";
import type { CentroFormValues } from "../../components/FormComponents/schemas";

export interface Centro extends CentroFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListCentrosResponse { count: number; centros: Centro[] }

export const getCentros = () => apiFetch<ListCentrosResponse>("/admin/centros");
export const createCentro = (data: CentroFormValues) => apiFetch<Centro>("/admin/centros", { method: "POST", body: JSON.stringify(data) });
export const updateCentro = (id: string, data: Partial<CentroFormValues>) => apiFetch<Centro>(`/admin/centros/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCentro = (id: string) => apiFetch<{ message: string }>(`/admin/centros/${id}`, { method: "DELETE" });
