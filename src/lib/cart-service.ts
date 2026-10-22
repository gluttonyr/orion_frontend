import { apiRequest } from './api';
import type { ProductRecord } from './catalog-service';

export type CartRecord = {
  id: number;
  utilisateurId: number;
  items: Array<{ product: ProductRecord; quantity: number }>;
};

export function getMyCart(token: string) {
  return apiRequest<CartRecord>('/panier/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function saveMyCart(token: string, items: Array<{ productId: number; quantity: number }>) {
  return apiRequest<CartRecord>('/panier/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items }),
  });
}
