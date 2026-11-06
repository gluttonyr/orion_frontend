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
  pays?: string | null;
  localisation?: string | null;
  proprietaireId?: number | null;
  boutiqueId?: number | null;
  boutiqueNom?: string | null;
};

export type ProductReview = {
  id: number;
  note: number;
  commentaire: string | null;
  dateCreation: string;
  auteur: string;
};

export type ProductReviews = {
  moyenne: number;
  nombre: number;
  avis: ProductReview[];
};

export async function getProducts() {
  return apiRequest<ProductRecord[]>("/produits");
}

export function searchProductSuggestions(query: string, limit = 5) {
  const params = new URLSearchParams({ q: query, limit: String(Math.min(50, Math.max(1, limit))) });
  return apiRequest<ProductRecord[]>(`/produits/search?${params.toString()}`);
}

export function categoryLabel(categorie: ProductRecord["categorie"], fallback = "Divers"): string {
  if (typeof categorie === "string") return categorie || fallback;
  return categorie?.libellé || fallback;
}

export async function getProductsByOwner(ownerId: number, token: string) {
  const products = await apiRequest<ProductRecord[]>(`/produits/owner/${ownerId}`, { headers: { Authorization: `Bearer ${token}` } });
  return products.map((product) => ({
    ...product,
    categorie: categoryLabel(product.categorie),
  }));
}

export async function getProductById(id: number) {
  return apiRequest<ProductRecord>(`/produits/${id}`);
}

export function getProductReviews(id: number) {
  return apiRequest<ProductReviews>(`/produits/${id}/avis`);
}

export function saveProductReview(id: number, note: number, commentaire: string, token: string) {
  return apiRequest<{ ok: boolean; moyenne: number; nombre: number; avis: ProductReview[] }>(`/produits/${id}/avis`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ note, commentaire }),
  });
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
