import { apiFetch, publicFetch } from "./api";
import type { DonationForm, DonationRepeatedValues, DonationResponse, DonationValue } from "../donations/types";

export interface ListDonationFormsResponse {
  count: number;
  forms: DonationForm[];
}

export interface ListDonationResponsesResponse {
  count: number;
  responses: DonationResponse[];
}

export type SubmitDonationPayload = {
  source: DonationResponse["source"];
  values: Record<string, DonationValue>;
  repeatedValues?: DonationRepeatedValues;
  userAgent?: string;
};

export type SubmitDonationResult = DonationResponse & {
  recordsCreated?: number;
};

export const getPublicDonationForms = () =>
  publicFetch<ListDonationFormsResponse>("/donation-forms");

export const getPublicDonationForm = (slug: string) =>
  publicFetch<DonationForm>(`/donation-forms/${encodeURIComponent(slug)}`);

export const submitDonationResponse = (formId: string, data: SubmitDonationPayload) =>
  publicFetch<SubmitDonationResult>(`/donation-forms/${encodeURIComponent(formId)}/responses`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getAdminDonationForms = () =>
  apiFetch<ListDonationFormsResponse>("/admin/donation-forms");

export const createAdminDonationForm = (data: DonationForm) =>
  apiFetch<DonationForm>("/admin/donation-forms", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAdminDonationForm = (id: string, data: DonationForm) =>
  apiFetch<DonationForm>(`/admin/donation-forms/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteAdminDonationForm = (id: string) =>
  apiFetch<{ message: string; id: string }>(`/admin/donation-forms/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const getAdminDonationResponses = (formId?: string) =>
  apiFetch<ListDonationResponsesResponse>(
    formId ? `/admin/donation-responses?formId=${encodeURIComponent(formId)}` : "/admin/donation-responses",
  );
