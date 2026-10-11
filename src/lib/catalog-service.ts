import { apiRequest } from "./api";

export type ProductRecord = {
  id: number;
  nom: string;
  image?: string;
  images_secondaires?: string[];
  prix: number;
  description: string;
  stock: number;
  statut?: string;
  categorie?: string | { libellé?: string | null } | null;
  categorieId?: number;
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

export async function createProduct(payload: Record<string, unknown>, token: string) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
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

  return apiRequest<ProductRecord>("/produits", { method: "POST", body: formData, headers: { Authorization: `Bearer ${token}` } });
}
