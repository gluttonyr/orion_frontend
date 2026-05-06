import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Categorie } from "../model/model";

class CategorieService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "http://localhost:3000/categorie",
    });
  }

  // =======================
  // CREATE CATEGORIE
  // =======================
  async create(data: Partial<Categorie>): Promise<Categorie> {
    const res = await this.api.post("/", data);
    return res.data;
  }

  // =======================
  // GET ALL CATEGORIES
  // =======================
  async getAll(): Promise<Categorie[]> {
    const res = await this.api.get("/");
    return res.data;
  }

  // =======================
  // GET ONE CATEGORIE
  // =======================
  async getById(id: number): Promise<Categorie> {
    const res = await this.api.get(`/${id}`);
    return res.data;
  }

  // =======================
  // UPDATE CATEGORIE
  // =======================
  async update(id: number, data: Partial<Categorie>): Promise<Categorie> {
    const res = await this.api.put(`/${id}`, data);
    return res.data;
  }

  // =======================
  // DELETE CATEGORIE
  // =======================
  async delete(id: number) {
    const res = await this.api.delete(`/${id}`);
    return res.data;
  }
}

// Singleton (comme boutique)
export const categorieService = new CategorieService();