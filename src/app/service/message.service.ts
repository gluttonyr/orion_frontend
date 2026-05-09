import { createApi } from "./api.config";
import type { Message } from "../model/model";

const api = createApi("message");

class MessageService {
  async create(messageData: Partial<Message>) {
    const res = await api.post("/", messageData);
    return res.data;
  }

  async getAll(): Promise<Message[]> {
    const res = await api.get("/");
    return res.data;
  }

  async getById(id: number): Promise<Message> {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  async update(id: number, messageData: Partial<Message>) {
    const res = await api.put(`/${id}`, messageData);
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
}

export const messageService = new MessageService();
