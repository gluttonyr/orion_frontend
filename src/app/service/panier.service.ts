import { createApi } from "./api.config";
import type { Panier } from "../model/model";

const api = createApi("panier");

class PanierService {
  // CREATE PANIER
  async create(panierData: Partial<Panier>) {
    const res = await api.post("/", panierData);
    return res.data;
  }

  // GET ALL PANIERS
  async getAll(): Promise<Panier[]> {
    const res = await api.get("/");
    return res.data;
  }

  // GET PANIER BY ID
  async getById(id: number): Promise<Panier> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // GET PANIERS BY UTILISATEUR
  async getByUtilisateur(utilisateurId: number): Promise<Panier[]> {
    const res = await api.get(`/utilisateur/${utilisateurId}`);
    return res.data;
  }

  // UPDATE PANIER
  async update(id: number, panierData: Partial<Panier>) {
    const res = await api.put(`/${id}`, panierData);
    return res.data;
  }

  // DELETE PANIER
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }

  // CHECKOUT PANIER
  async checkout(id: number) {
    const res = await api.post(`/${id}/checkout`);
    return res.data;
  }
}

export default new PanierService();