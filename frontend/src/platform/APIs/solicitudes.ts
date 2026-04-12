import { apiFetch, publicFetch } from "./api";
import type { VolunteerFormValues } from "../../components/FormComponents/schemas";

export interface Solicitud {
  id: string;
  tipo: "registro" | "cambio_rol";
  status: "pendiente" | "aprobada" | "rechazada";
  nombre: string;
  email: string;
  rolSolicitado: string;
  mensaje?: string;
  fecha: string;
  voluntarioUsername?: string;
  // Campos del formulario público
  phone?: string;
  idDocument?: string;
  birthDate?: string;
  address?: string;
  socialMedia?: string;
  occupation?: string;
  educationLevel?: string;
  skills?: string;
  areas?: string[];
  availability?: string;
  weeklyHours?: string;
  motivation?: string;
  referral?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
}

export interface ListSolicitudesResponse { count: number; solicitudes: Solicitud[] }

export const getSolicitudes = () => apiFetch<ListSolicitudesResponse>("/admin/solicitudes");
export const resolverSolicitud = (id: string, accion: "aprobar" | "rechazar") =>
  apiFetch<Solicitud>(`/admin/solicitudes/${id}`, { method: "PUT", body: JSON.stringify({ accion }) });

// Público — formulario de voluntario
export const submitVolunteer = (data: VolunteerFormValues) =>
  publicFetch<{ message: string; id: string }>("/voluntarios", { method: "POST", body: JSON.stringify(data) });

export interface InviteUserResponse {
  message: string;
  email: string;
  tempPassword: string;
}

export const inviteUserToSystem = (email: string, name: string) =>
  apiFetch<InviteUserResponse>("/admin/invite-user", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });

export interface GetTempPasswordResponse {
  message: string;
  username: string;
  tempPassword: string;
  userStatus: string;
}

export const getTempPassword = (username: string) =>
  apiFetch<GetTempPasswordResponse>(`/admin/users/${username}/temp-password`);
