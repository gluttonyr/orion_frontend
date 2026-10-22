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

export async function getStores() {
  return apiRequest<StoreRecord[]>("/boutique");
}

export async function getMyStores(token: string) {
  return apiRequest<StoreRecord[]>("/boutique/mine", { headers: { Authorization: `Bearer ${token}` } });
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
