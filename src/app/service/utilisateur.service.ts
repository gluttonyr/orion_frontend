import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Utilisateur } from "../model/utilisateur.model";


class UserService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "http://localhost:3000/utilisateur",
    });
  }

  // =======================
  // REGISTER
  // =======================
  async register(userData: Partial<Utilisateur>) {
    const res = await this.api.post("/register", userData);
    return res.data;
  }

  // =======================
  // LOGIN
  // =======================
  async login(email: string, password: string) {
    const res = await this.api.post("/login", { email, password });
    return res.data;
  }

  // =======================
  // GET ALL USERS
  // =======================
  async getAll(): Promise<Utilisateur[]> {
    const res = await this.api.get("/");
    return res.data;
  }

  // =======================
  // GET ONE USER
  // =======================
  async getById(id: number): Promise<Utilisateur> {
    const res = await this.api.get(`/${id}`);
    return res.data;
  }

  // =======================
  // UPDATE USER + IMAGE
  // =======================
  async update(
    id: number,
    userData: Partial<Utilisateur>,
    imageFile?: File
  ) {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      formData.append(key, (userData as any)[key]);
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await this.api.put(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  }

  // =======================
  // DELETE USER
  // =======================
  async delete(id: number) {
    const res = await this.api.delete(`/${id}`);
    return res.data;
  }
}

// Singleton (important)
export const userService = new UserService();