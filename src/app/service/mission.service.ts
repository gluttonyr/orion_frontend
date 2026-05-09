import { createApi } from "./api.config";
import type { Mission } from "../model/model";

const api = createApi("mission");

class MissionService {
  // CREATE MISSION
  async create(missionData: Partial<Mission>) {
    const res = await api.post("/", missionData);
    return res.data;
  }

  // GET ALL MISSIONS
  async getAll(): Promise<Mission[]> {
    const res = await api.get("/");
    return res.data;
  }

  // GET MISSION BY ID
  async getById(id: number): Promise<Mission> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // UPDATE MISSION
  async update(id: number, missionData: Partial<Mission>) {
    const res = await api.put(`/${id}`, missionData);
    return res.data;
  }

  // DELETE MISSION
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const mission = new MissionService();