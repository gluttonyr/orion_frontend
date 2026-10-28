import type { PurchaseRecord } from "./order-service";
import type { MissionApplicationRecord, MissionRecord } from "./mission-service";

export type ClientDashboardStats = {
  totalSpent: number;
  paidOrders: number;
  monthly: Array<{ label: string; spent: number; orders: number }>;
  applications: number;
  applicationStatuses: Array<{ name: string; value: number }>;
  openOpportunities: number;
  averagePay: number;
  topOpportunities: Array<{ id: number; title: string; amount: number; frequency?: string }>;
};

// Computed client-side from /vente/mes-achats, /mission/applications/me and /mission; months with no activity stay at zero.
export function buildClientDashboardStats(purchases: PurchaseRecord[], applications: MissionApplicationRecord[], missions: MissionRecord[], now = new Date()): ClientDashboardStats {
  const paid = purchases.filter((purchase) => purchase.statut === "payee");
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""), spent: 0, orders: 0 };
  });
  for (const purchase of paid) {
    const date = new Date(purchase.date_achat);
    const month = monthly.find((item) => item.key === `${date.getFullYear()}-${date.getMonth()}`);
    if (month) { month.spent += Number(purchase.prix_total ?? 0); month.orders += 1; }
  }
  const countStatus = (status: string) => applications.filter((item) => item.candidature?.statut === status).length;
  const amounts = missions.map((mission) => Number(mission.montant ?? 0)).filter((amount) => amount > 0);
  return {
    totalSpent: paid.reduce((sum, purchase) => sum + Number(purchase.prix_total ?? 0), 0),
    paidOrders: paid.length,
    monthly: monthly.map(({ label, spent, orders }) => ({ label, spent, orders })),
    applications: applications.length,
    applicationStatuses: [
      { name: "En attente", value: countStatus("en_attente") },
      { name: "Acceptées", value: countStatus("accepté") },
      { name: "Refusées", value: countStatus("refusé") },
    ],
    openOpportunities: missions.length,
    averagePay: amounts.length ? Math.round(amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length) : 0,
    topOpportunities: missions
      .filter((mission) => Number(mission.montant ?? 0) > 0)
      .sort((a, b) => Number(b.montant) - Number(a.montant))
      .slice(0, 5)
      .map((mission) => ({ id: mission.id, title: mission.titre, amount: Number(mission.montant), frequency: mission.frequencePaiement })),
  };
}
