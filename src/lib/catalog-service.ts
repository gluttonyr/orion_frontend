import { apiRequest } from "./api";

export type ProductRecord = {
  id: number;
  nom: string;
  image?: string;
  images_secondaires?: string[];
  prix: number;
  prixPromotionnel?: number | null;
  description: string;
  stock: number;
  statut?: string;
  categorie?: string | { libellé?: string | null } | null;
  categorieId?: number;
  likesCount?: number;
};

export async function getProducts() {
  return apiRequest<ProductRecord[]>("/produits");
}

export async function getProductsByOwner(ownerId: number, token: string) {
  const products = await apiRequest<ProductRecord[]>(`/produits/owner/${ownerId}`, { headers: { Authorization: `Bearer ${token}` } });
  return products.map((product) => ({
    ...product,
    categorie: typeof product.categorie === "object" && product.categorie !== null
      ? Object.values(product.categorie)[0] ?? "Divers"
      : product.categorie,
  }));
}

export async function getProductById(id: number) {
  return apiRequest<ProductRecord>(`/produits/${id}`);
}

export function setProductLike(id: number, visitorId: string, liked: boolean) {
  return apiRequest<{ count: number; liked: boolean }>(`/produits/${id}/likes`, {
    method: "PUT",
    body: JSON.stringify({ visitorId, liked }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function createProduct(payload: Record<string, unknown>, token: string) {
  const formData = toProductFormData(payload);
  return apiRequest<ProductRecord>("/produits", { method: "POST", body: formData, headers: { Authorization: `Bearer ${token}` } });
}

export async function updateProduct(id: number, payload: Record<string, unknown>, token: string) {
  const formData = toProductFormData(payload);
  return apiRequest<ProductRecord>(`/produits/${id}`, { method: "PUT", body: formData, headers: { Authorization: `Bearer ${token}` } });
}

export function publishProduct(id: number, token: string) {
  return apiRequest<ProductRecord>(`/produits/${id}/publish`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
}

function toProductFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) {
      formData.append(key, "");
      return;
    }
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item instanceof File ? item : String(item)));
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
}
