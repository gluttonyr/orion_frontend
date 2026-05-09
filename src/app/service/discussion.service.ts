import { createApi } from "./api.config";
import type { Discussion } from "../model/model";

const api = createApi("discussion");
class DiscussionService {
  async create(discussionData: Partial<Discussion>) {
    const res = await api.post("/", discussionData);
    return res.data;
  }

  async getAll(): Promise<Discussion[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getById(id: number): Promise<Discussion> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async update(id: number, discussionData: Partial<Discussion>) {
    const res = await api.put(`/${id}`, discussionData);
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const discussionService = new DiscussionService();
