import { createApi } from "./api.config";
import type { produits } from "../model/model";

const api = createApi("produits");

class ProduitService {
  async create(produitData: Partial<produits>, imageFile?: File | string) {
    const formData = new FormData();
    Object.keys(produitData).forEach((key) => {
      formData.append(key, (produitData as any)[key]);
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }
    const res = await api.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }

  // =======================
  // GET ALL PRODUITS
  // =======================
  async getAll(): Promise<produits[]> {
    const res = await api.get("/");
    console.log("Get all produits response:", res.data);
    return res.data;
  }

  // =======================
  // GET ONE PRODUITS
  // =======================
  async getById(id: number): Promise<produits> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // =======================
  // UPDATE PRODUITS
  // =======================
  async update(
    id: number,
    userData: Partial<produits>,
    imageFile?: File | string
  ) {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      formData.append(key, (userData as any)[key]);
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await api.patch(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  }

  // =======================
  // DELETE PRODUITS
  // =======================
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

// Singleton (important)
export const produitService = new ProduitService();