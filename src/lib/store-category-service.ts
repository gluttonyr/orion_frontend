import { apiRequest } from './api';

export type StoreCategory = { id: number; nom: string };

export const getStoreCategories = () => apiRequest<StoreCategory[]>('/boutique-categories');

export const createStoreCategory = (nom: string, token: string) => apiRequest<StoreCategory>('/boutique-categories', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ nom }),
});

export const updateStoreCategory = (id: number, nom: string, token: string) => apiRequest<StoreCategory>(`/boutique-categories/${id}`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ nom }),
});

export const deleteStoreCategory = (id: number, token: string) => apiRequest<{ success: boolean }>(`/boutique-categories/${id}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});
