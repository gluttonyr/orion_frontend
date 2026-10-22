import { apiRequest } from "./api";

export type SellerAnalytics = {
  from: string;
  to: string;
  summary: { revenue: number; orderCount: number; unitsSold: number; averageOrderValue: number };
  series: Array<{ date: string; revenue: number; orders: number; units: number }>;
  topProducts: Array<{ produitId: number; name: string; quantity: number; revenue: number; orders: number }>;
  recentOrders: Array<{ venteId: number; reference: string; date: string; montant: number; statut: string; articles: Array<{ produitId: number; nom: string; quantite: number; prixUnitaire: number }> }>;
};

export function getSellerAnalytics(token: string, from: string, to: string) {
  const query = new URLSearchParams({ from, to });
  return apiRequest<SellerAnalytics>(`/vente/seller/analytics?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
