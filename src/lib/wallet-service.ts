import { apiRequest } from './api';

export type SellerWallet = {
  disponible: number;
  bloque: number;
  rembourse: number;
  devise: string;
  versementAutomatiqueActif: boolean;
  messageVersement: string;
  mouvements: Array<{ id: number; venteId: number; montant: number; montantBrut: number; commissionMontant: number; commissionPourcentage: number; statut: string; articles: Array<{ nom: string; quantite: number }>; date: string }>;
};

export type SellerOrderRemise = {
  remiseId: number;
  venteId: number;
  montant: number;
  montantBrut: number;
  commissionMontant: number;
  commissionPourcentage: number;
  statut: string;
  articles: Array<{ nom: string; quantite: number }>;
  date: string;
  vente?: { reference?: string; utilisateurId?: number; date_achat?: string; statut?: string };
};

export function getSellerWallet(token: string) {
  return apiRequest<SellerWallet>('/vente/seller/wallet', { headers: { Authorization: `Bearer ${token}` } });
}

export function getSellerRemises(token: string) {
  return apiRequest<SellerOrderRemise[]>('/vente/seller/remises', { headers: { Authorization: `Bearer ${token}` } });
}

export function createHandoverQr(remiseId: number, token: string) {
  return apiRequest<{ content: string; qrDataUrl: string; remiseId: number; venteId: number; montant: number }>(`/vente/seller/remises/${remiseId}/qr`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` },
  });
}

export function confirmHandover(content: string, venteId: number, token: string) {
  return apiRequest<{ ok: boolean; venteId: number; montant: number; statut: string }>('/vente/remise/confirm', {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ content, venteId }),
  });
}
