import { apiRequest } from './api';

export type PurchaseRecord = {
  id: number;
  reference: string;
  date_achat: string;
  prix_total: number;
  statut: string;
  produits?: { id: number; nom: string }[];
};

export function getMyPurchases(token: string) {
  return apiRequest<PurchaseRecord[]>('/vente/mes-achats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
