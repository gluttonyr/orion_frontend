import { createApi } from "./api.config";
import type { Categorie } from "../model/model";

const api = createApi("categorie");

class CategorieService {
  // =======================
  // CREATE CATEGORIE
  // =======================
  async create(data: Partial<Categorie>): Promise<Categorie> {
    const res = await api.post("/", data);
    return res.data;
  }

  // =======================
  // GET ALL CATEGORIES
  // =======================
  async getAll(): Promise<Categorie[]> {
    const res = await api.get("/");
    return res.data;
  }

  // =======================
  // GET ONE CATEGORIE
  // =======================
  async getById(id: number): Promise<Categorie> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // =======================
  // UPDATE CATEGORIE
  // =======================
  async update(id: number, data: Partial<Categorie>): Promise<Categorie> {
    const res = await api.put(`/${id}`, data);
    return res.data;
  }

  // =======================
  // DELETE CATEGORIE
  // =======================
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

// Singleton (comme boutique)
export const categorieService = new CategorieService();