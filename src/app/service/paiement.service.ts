import { createApi } from "./api.config";

const api = createApi("paiement");

export interface TransactionStatusResult {
  id: number;
  reference: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
}

class PaiementService {
  async check(reference: string): Promise<TransactionStatusResult> {
    const res = await api.get(`/check/${reference}`);
    return res.data;
  }
}

export const paiementService = new PaiementService();
