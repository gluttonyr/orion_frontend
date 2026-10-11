import { apiRequest } from "./api";

export type MessageRecord = {
  id: number;
  discussionId: number;
  senderId: number;
  contenu: string;
  type?: string;
  statut?: string;
  mediaUrl?: string;
  createdAt?: string | Date;
  edited?: boolean;
  deleted?: boolean;
};

export async function getMessages(token?: string) {
  return apiRequest<MessageRecord[]>("/api/message", token ? { headers: { Authorization: `Bearer ${token}` } } : {});
}

export async function getMessageById(id: number) {
  return apiRequest<MessageRecord>(`/api/message/${id}`);
}

export async function createMessage(payload: Record<string, unknown>, token?: string) {
  return apiRequest<MessageRecord>("/api/message", {
    method: "POST",
    body: JSON.stringify(payload),
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
}

export async function updateMessage(id: number, payload: Record<string, unknown>) {
  return apiRequest<MessageRecord>(`/api/message/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
