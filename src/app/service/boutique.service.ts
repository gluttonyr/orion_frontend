import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Boutique } from "../model/model";

class BoutiqueService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "http://localhost:3000/boutique",
    });
  }

  // =======================
  // CREATE BOUTIQUE (supports JSON or FormData)
  // =======================
  async create(data: FormData): Promise<Boutique> {
    // Axios will set the correct multipart headers automatically for FormData
    const res = await this.api.post("/", data, {
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
    const res = await this.api.get("/");
    return res.data;
  }

  // =======================
  // GET ONE BOUTIQUE
  // =======================
  async getById(id: number): Promise<Boutique> {
    const res = await this.api.get(`/${id}`);
    return res.data;
  }

  // =======================
  // UPDATE BOUTIQUE
  // =======================
  async update(id: number, data: FormData): Promise<Boutique> {
    // Le contrôleur backend utilise @Put(':id')
    const res = await this.api.put(`/${id}`, data, {
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
    const res = await this.api.delete(`/${id}`);
    return res.data;
  }
}

// Singleton (important)
export const boutiqueService = new BoutiqueService();
