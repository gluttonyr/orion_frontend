import { apiRequest } from "./api";

export type ProductCategory = { id: number; libellé: string; dexcription: string };

export const getProductCategories = () => apiRequest<ProductCategory[]>("/categorie");

export const createProductCategory = (libellé: string, token: string) => apiRequest<ProductCategory>("/categorie", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ libellé, dexcription: libellé }),
});

export const updateProductCategory = (id: number, libellé: string, token: string) => apiRequest<ProductCategory>(`/categorie/${id}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ libellé, dexcription: libellé }),
});

export const deleteProductCategory = (id: number, token: string) => apiRequest<ProductCategory>(`/categorie/${id}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
