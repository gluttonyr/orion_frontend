import { createApi } from "./api.config";
import type { Demande } from "../model/model";

const api = createApi("demande");
class DemandeService {
  async create(demandeData: Partial<Demande>) {
    const res = await api.post("/", demandeData);
    return res.data;
  }

  async getAll(): Promise<Demande[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getById(id: number): Promise<Demande> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async update(id: number, demandeData: Partial<Demande>) {
    const res = await api.put(`/${id}`, demandeData);
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const demandeService = new DemandeService();
