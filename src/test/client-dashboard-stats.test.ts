import { describe, expect, it } from "vitest";
import { buildClientDashboardStats } from "../lib/client-dashboard-stats";
import type { PurchaseRecord } from "../lib/order-service";
import type { MissionApplicationRecord, MissionRecord } from "../lib/mission-service";

const now = new Date(2026, 9, 15);

describe("buildClientDashboardStats", () => {
  it("returns six zeroed months and empty totals without activity", () => {
    const stats = buildClientDashboardStats([], [], [], now);
    expect(stats.monthly).toHaveLength(6);
    expect(stats.monthly.every((month) => month.spent === 0 && month.orders === 0)).toBe(true);
    expect(stats.totalSpent).toBe(0);
    expect(stats.averagePay).toBe(0);
    expect(stats.applicationStatuses.map((item) => item.value)).toEqual([0, 0, 0]);
  });

  it("counts only paid purchases, buckets them by month and ranks paid opportunities", () => {
    const purchases = [
      { id: 1, reference: "A", date_achat: "2026-10-02T10:00:00", prix_total: 5000, statut: "payee" },
      { id: 2, reference: "B", date_achat: "2026-08-20T10:00:00", prix_total: 2000, statut: "payee" },
      { id: 3, reference: "C", date_achat: "2026-10-03T10:00:00", prix_total: 9000, statut: "remboursee" },
      { id: 4, reference: "D", date_achat: "2025-01-03T10:00:00", prix_total: 1000, statut: "payee" },
    ] as PurchaseRecord[];
    const applications = [
      { candidature: { statut: "en_attente" } },
      { candidature: { statut: "accepté" } },
      { candidature: { statut: "accepté" } },
    ] as MissionApplicationRecord[];
    const missions = [
      { id: 1, titre: "Petit", localisation: "", montant: 1000 },
      { id: 2, titre: "Grand", localisation: "", montant: "30000" },
      { id: 3, titre: "Bénévole", localisation: "" },
    ] as MissionRecord[];

    const stats = buildClientDashboardStats(purchases, applications, missions, now);
    expect(stats.totalSpent).toBe(8000);
    expect(stats.paidOrders).toBe(3);
    expect(stats.monthly[5]).toMatchObject({ spent: 5000, orders: 1 });
    expect(stats.monthly[3]).toMatchObject({ spent: 2000, orders: 1 });
    expect(stats.applicationStatuses.map((item) => item.value)).toEqual([1, 2, 0]);
    expect(stats.openOpportunities).toBe(3);
    expect(stats.averagePay).toBe(15500);
    expect(stats.topOpportunities.map((item) => item.title)).toEqual(["Grand", "Petit"]);
  });
});
