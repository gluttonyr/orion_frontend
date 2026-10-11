import { apiRequest } from "./api";

export type DemandeRecord = {
  id?: number;
  missionId?: number;
  utilisateurId?: number;
  statut?: string;
  message?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export async function getDemandes(token?: string) {
  return apiRequest<DemandeRecord[]>("/demande", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function createDemande(payload: Record<string, unknown>, token?: string) {
  return apiRequest<DemandeRecord>("/demande", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });
}
