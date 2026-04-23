import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Panier } from "../model/model";

class PanierService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "http://localhost:3000/panier",
    });
  }

  // CREATE PANIER
  async create(panierData: Partial<Panier>) {
    const res = await this.api.post("/", panierData);
    return res.data;
  }

  // GET ALL PANIERS
  async getAll(): Promise<Panier[]> {
    const res = await this.api.get("/");
    return res.data;
  }

  // GET PANIER BY ID
  async getById(id: number): Promise<Panier> {
    const res = await this.api.get(`/${id}`);
    return res.data;
  }

  // GET PANIERS BY UTILISATEUR
  async getByUtilisateur(utilisateurId: number): Promise<Panier[]> {
    const res = await this.api.get(`/utilisateur/${utilisateurId}`);
    return res.data;
  }

  // UPDATE PANIER
  async update(id: number, panierData: Partial<Panier>) {
    const res = await this.api.put(`/${id}`, panierData);
    return res.data;
  }

  // DELETE PANIER
  async delete(id: number) {
    const res = await this.api.delete(`/${id}`);
    return res.data;
  }

  // CHECKOUT PANIER
  async checkout(id: number) {
    const res = await this.api.post(`/${id}/checkout`);
    return res.data;
  }
}

export default new PanierService();