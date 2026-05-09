import { createApi } from "./api.config";
import type { Vente } from "../model/model";

const api = createApi("vente");

class VenteService {
  async create(venteData: Partial<Vente>) {
    const res = await api.post("/", venteData);
    return res.data;
  }

  async getAll(): Promise<Vente[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getById(id: number): Promise<Vente> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async update(id: number, venteData: Partial<Vente>) {
    const res = await api.put(`/${id}`, venteData);
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const venteService = new VenteService();
