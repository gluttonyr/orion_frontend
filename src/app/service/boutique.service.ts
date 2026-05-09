import { createApi } from "./api.config";
import type { Boutique } from "../model/model";

const api = createApi("boutique");
class BoutiqueService {
  // =======================
  // CREATE BOUTIQUE (supports JSON or FormData)
  // =======================
  async create(data: FormData): Promise<Boutique> {
    // Axios will set the correct multipart headers automatically for FormData
    const res = await api.post("/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }

  // =======================
  // GET ALL BOUTIQUES
  // =======================
  async getAll(): Promise<Boutique[]> {
    const res = await api.get("/");
    return res.data;
  }

  // =======================
  // GET ONE BOUTIQUE
  // =======================
  async getById(id: number): Promise<Boutique> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // =======================
  // UPDATE BOUTIQUE
  // =======================
  async update(id: number, data: FormData): Promise<Boutique> {
    // Le contrôleur backend utilise @Put(':id')
    const res = await api.put(`/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }

  // =======================
  // DELETE BOUTIQUE
  // =======================
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

// Singleton (important)
export const boutiqueService = new BoutiqueService();
