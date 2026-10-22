import { apiRequest } from './api';

export type PurchaseRecord = {
  id: number;
  reference: string;
  date_achat: string;
  prix_total: number;
  statut: string;
  produits?: { id: number; nom: string }[];
  remises?: Array<{ id: number; commercantId: number; montant: number; statut: string; articles: Array<{ nom: string; quantite: number }>; dateRemise?: string | null }>;
};

export function getMyPurchases(token: string) {
  return apiRequest<PurchaseRecord[]>('/vente/mes-achats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
