import { createApi } from "./api.config";
import type { Plan } from "../model/model";

const api = createApi("plan");

class PlanService {
  // CREATE PLAN
  async create(planData: Partial<Plan>) {
    const res = await api.post("/", planData);
    return res.data;
  }

  // GET ALL PLANS
  async getAll(): Promise<Plan[]> {
    const res = await api.get("/");
    return res.data;
  }

  // GET PLAN BY ID
  async getById(id: number): Promise<Plan> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // UPDATE PLAN
  async update(id: number, planData: Partial<Plan>) {
    const res = await api.put(`/${id}`, planData);
    return res.data;
  }

  // DELETE PLAN
  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export default new PlanService();