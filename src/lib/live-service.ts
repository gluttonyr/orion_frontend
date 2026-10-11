import { apiRequest } from './api';

export async function recordLiveProductVisit(liveSessionId: number, productId: number) {
  return apiRequest<{ recorded: boolean; liveSessionId: number }>(
    `/live/sessions/${liveSessionId}/products/${productId}/visit`,
    { method: 'POST' },
  );
}

export async function createFedaPayPayment(payload: {
  produitIds: number[];
  quantites: number[];
  platform: 'web';
  liveSessionId?: number;
}, token: string) {
  return apiRequest<{ payment_url: string; reference: string; venteId: number }>(
    '/paiement/fedapay/init-payment',
    { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function checkFedaPayPayment(reference: string) {
  return apiRequest<{ status?: string; purpose?: string; vente?: { statut?: string }; mission?: { id: number; statut?: string; publicationPayee?: boolean } }>(
    `/paiement/fedapay/check/${encodeURIComponent(reference)}`,
  );
}
