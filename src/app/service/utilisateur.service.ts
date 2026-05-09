import { createApi } from "./api.config";
import type { Utilisateur } from "../model/model";

const api = createApi("utilisateur");

class UserService {
  // REGISTER
  async register(userData: Partial<Utilisateur>) {
    const res = await api.post("/register", userData);
    console.log("Register response:", res.data);
    return res.data;
  }

  // LOGIN
  async login(email: string, password: string) {
    const res = await api.post("/login", { email, password });
    return res.data;
  }

  // GET ALL USERS
  async getAll(): Promise<Utilisateur[]> {
    const res = await api.get("/");
    console.log("Get all users response:", res.data);
    return res.data;
  }

  // GET ONE USER
  async getById(id: number): Promise<Utilisateur> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // UPDATE USER + IMAGE
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

    const res = await api.put(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  }

  // GET CURRENT USER
  async getCurrent(token?: string): Promise<Utilisateur> {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;

    const res = await api.get("auth/me", config);
    console.log("Get current user response:", res.data);
    return res.data;
  }

  // DELETE USER
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

// Singleton (important)
export const userService = new UserService();