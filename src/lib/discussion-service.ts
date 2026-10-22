import { apiRequest } from "./api";

export type DiscussionRecord = {
  id: number;
  type?: string;
  statut?: string;
  titre?: string;
  photo?: string;
  lastMessage?: string;
  lastMessageDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  contactUser?: {
    id: number;
    nom?: string | null;
    prenom?: string | null;
    image?: string | null;
  } | null;
};

export async function getDiscussions(token?: string) {
  return apiRequest<DiscussionRecord[]>("/api/discussion", token ? { headers: { Authorization: `Bearer ${token}` } } : {});
}

export async function getDiscussionById(id: number) {
  return apiRequest<DiscussionRecord>(`/api/discussion/${id}`);
}

export async function createDiscussion(payload: Record<string, unknown>) {
  return apiRequest<DiscussionRecord>("/api/discussion", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDiscussion(id: number, payload: Record<string, unknown>) {
  return apiRequest<DiscussionRecord>(`/api/discussion/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
