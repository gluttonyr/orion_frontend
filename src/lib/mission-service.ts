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

export function formatMissionRemuneration(amount: number | string | undefined, frequency?: string): string {
  const formattedAmount = `${Number(amount ?? 0).toLocaleString("fr-FR")} FCFA`;
  const frequencyLabel: Record<string, string> = {
    fixe: " · une seule fois",
    horaire: " · par heure",
    journalier: " · par jour",
    hebdomadaire: " · par semaine",
    mensuel: " · par mois",
    annuel: " · par an",
    projet: " · par projet",
  };
  return `${formattedAmount}${frequency ? frequencyLabel[frequency.toLowerCase()] ?? "" : ""}`;
}

export type MissionCandidate = {
  userId: number;
  statut: string;
  dateCandidature: string | Date;
  message: string;
  candidat: { id: number; nom?: string; prenom?: string; email?: string; adresse?: string; telephone?: string; specialite?: string; image?: string };
  discussionId?: number;
};

export type MissionApplicationRecord = MissionRecord & {
  candidature: Pick<MissionCandidate, "userId" | "statut" | "dateCandidature" | "message">;
  commercant?: { id: number; nom?: string; prenom?: string; email?: string } | null;
};

export async function getMissions() {
  return apiRequest<MissionRecord[]>("/mission");
}

export async function getMissionById(id: number, token?: string) {
  const response = await apiRequest<MissionRecord | MissionRecord[]>(`/mission/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!Array.isArray(response)) return response;
  const mission = response.find((item) => String(item.id) === String(id));
  if (!mission) throw new Error(`L’API n’a renvoyé aucune opportunité correspondant à l’identifiant ${id}.`);
  return mission;
}

export async function getMyMissions(token: string) {
  return apiRequest<MissionRecord[]>("/mission/mine", { headers: { Authorization: `Bearer ${token}` } });
}

export async function getMyApplications(token: string) {
  return apiRequest<MissionApplicationRecord[]>("/mission/applications/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
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
