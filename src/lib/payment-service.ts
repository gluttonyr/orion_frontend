import { apiRequest } from "./api";

export type PaymentNotifyPayload = Record<string, unknown>;

export async function notifyPayment(payload: PaymentNotifyPayload) {
  return apiRequest<{ received: boolean }>("/paiement/notify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function checkPayment(reference: string) {
  return apiRequest<Record<string, unknown>>(`/paiement/check/${encodeURIComponent(reference)}`);
}
