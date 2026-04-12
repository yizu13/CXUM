import { apiFetch, publicFetch } from "./api";
import type { NoticiaFormValues } from "../../components/FormComponents/schemas";

export interface Noticia extends Omit<NoticiaFormValues, "tags"> {
  id: string;
  slug: string;
  tags: string[];
  vistas: number;
  likes: number;
  compartidos: number;
  fechaPublicacion: string;
  createdAt: string;
}

export interface ListNoticiasResponse { count: number; noticias: Noticia[] }

// Admin (autenticado)
export const getNoticiasAdmin = () => apiFetch<ListNoticiasResponse>("/admin/noticias");
export const createNoticia = (data: NoticiaFormValues) => apiFetch<Noticia>("/admin/noticias", { method: "POST", body: JSON.stringify(data) });
export const updateNoticia = (id: string, data: Partial<NoticiaFormValues>) => apiFetch<Noticia>(`/admin/noticias/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteNoticia = (id: string) => apiFetch<{ message: string }>(`/admin/noticias/${id}`, { method: "DELETE" });

// Público
export const getNoticias = () => publicFetch<ListNoticiasResponse>("/noticias");
export const getNoticia = (slug: string) => publicFetch<Noticia>(`/noticias/${slug}`);
