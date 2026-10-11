import { apiRequest } from "./api";

export type MissionRecord = {
  id: number;
  titre: string;
  localisation: string;
  type?: string;
  statut?: string;
  publicationPayee?: boolean;
  descriptionCourte?: string;
  description?: string;
  montant?: number | string;
  frequencePaiement?: string;
  dureeMission?: number;
  datePublication?: string | Date;
  dateLimiteCandidature?: string | Date;
  requis?: string;
  commercantId?: number;
  candidatures?: MissionCandidate[];
};

export type MissionCandidate = {
  userId: number;
  statut: string;
  dateCandidature: string | Date;
  message: string;
  candidat: { id: number; nom?: string; prenom?: string; email?: string; specialite?: string; image?: string };
};

export async function getMissions() {
  return apiRequest<MissionRecord[]>("/mission");
}

export async function getMissionById(id: number, token?: string) {
  return apiRequest<MissionRecord>(`/mission/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

export async function getMyMissions(token: string) {
  return apiRequest<MissionRecord[]>("/mission/mine", { headers: { Authorization: `Bearer ${token}` } });
}

export async function applyToMission(id: number, message: string, token: string) {
  return apiRequest<MissionCandidate>(`/mission/${id}/candidatures`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ message }),
  });
}

export async function getMyMissionApplication(id: number, token: string) {
  return apiRequest<MissionCandidate | null>(`/mission/${id}/candidatures/me`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function getMissionCandidates(id: number, token: string) {
  return apiRequest<MissionCandidate[]>(`/mission/${id}/candidatures`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function updateMissionCandidateStatus(id: number, userId: number, statut: "acceptee" | "refusee", token: string) {
  return apiRequest<MissionCandidate>(`/mission/${id}/candidatures/${userId}`, {
    method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ statut }),
  });
}

export async function createMission(payload: Record<string, unknown>, token: string) {
  return apiRequest<MissionRecord>("/mission", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function startMissionPublicationPayment(id: number, token: string) {
  return apiRequest<{ payment_url: string; reference: string; missionId: number }>(`/paiement/fedapay/mission/${id}/publication`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ platform: 'web' }),
  });
}

export async function updateMission(id: number, payload: Record<string, unknown>, token?: string) {
  return apiRequest<MissionRecord>(`/mission/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload), headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function deleteMission(id: number) {
  return apiRequest<{ deleted: boolean }>(`/mission/${id}`, {
    method: "DELETE",
  });
}
