import { apiRequest } from "./api";

export type StoreRecord = {
  id: number;
  nom: string;
  description?: string;
  category?: string;
  location?: string;
  address?: string;
  logo?: string;
  active?: boolean;
  proprietaireId?: number;
  dateCreation?: string;
  nombreProduits?: number;
};

export type StoreReportRecord = {
  id: number;
  boutiqueId: number;
  produitId?: number | null;
  motif: string;
  dateCreation: string;
  resolu: boolean;
  utilisateurId?: number | null;
  boutique?: StoreRecord;
  produit?: { id: number; nom: string } | null;
};

export async function getStores() {
  return apiRequest<StoreRecord[]>("/boutique");
}

export async function getStoreById(id: string | number) {
  return apiRequest<StoreRecord>(`/boutique/${id}`);
}

export async function getMyStores(token: string) {
  return apiRequest<StoreRecord[]>("/boutique/mine", { headers: { Authorization: `Bearer ${token}` } });
}

export async function reportStore(id: number, reason: string, token: string) {
  return apiRequest<{ ok: boolean; boutiqueId: number; motif: string; reported: boolean }>(`/boutique/${id}/signaler`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ motif: reason }),
  });
}

export async function reportProduct(id: number, reason: string, token: string) {
  return apiRequest<{ ok: boolean; boutiqueId: number; produitId: number; motif: string; reported: boolean; reportId: number }>(`/produits/${id}/signaler`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ motif: reason }),
  });
}

export async function getStoreReports(token: string) {
  return apiRequest<StoreReportRecord[]>("/boutique/admin/signalements", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function setStoreActivation(id: number, active: boolean, token: string) {
  return apiRequest<StoreRecord>(`/boutique/admin/${id}/activation`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
}

export async function resolveStoreLocation(url: string, token: string) {
  return apiRequest<{ label: string | null }>("/boutique/resolve-location", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export async function createStore(payload: Record<string, unknown>, token?: string) {
  return saveStore("/boutique", "POST", payload, token);
}

export async function updateStore(id: number, payload: Record<string, unknown>, token?: string) {
  return saveStore(`/boutique/${id}`, "PUT", payload, token);
}

async function saveStore(path: string, method: "POST" | "PUT", payload: Record<string, unknown>, token?: string) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, String(item)));
      return;
    }
    formData.append(key, String(value));
  });

  return apiRequest<StoreRecord>(path, { method, ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}), body: formData });
}
