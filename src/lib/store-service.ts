import { apiRequest } from "./api";

export type StoreRecord = {
  id: number;
  nom: string;
  description?: string;
  category?: string;
  location?: string;
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

export async function createStore(payload: Record<string, unknown>, token?: string) {
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

  return apiRequest<StoreRecord>("/boutique", { method: "POST", ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}), body: formData });
}
