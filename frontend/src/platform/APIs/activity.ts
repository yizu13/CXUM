import { apiFetch } from "./api";

export interface ActivityEvent {
  pk: string;
  id: string;
  createdAt: string;
  type: string;
  icon: string;
  color: string;
  text: string;
  actor: string;
}

export const getActivity = () =>
  apiFetch<{ events: ActivityEvent[] }>("/admin/activity");
