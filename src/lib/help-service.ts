import { apiRequest } from './api';

export type HelpQuestion = { id: number; categorieId: number; titre: string; description: string };
export type HelpCategory = { id: number; titre: string; description: string; questions: HelpQuestion[] };
type HelpPayload = { titre: string; description: string };

const write = <T,>(path: string, method: 'POST' | 'PUT' | 'DELETE', token: string, body?: object) => apiRequest<T>(path, {
  method,
  headers: { Authorization: `Bearer ${token}` },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

export const getHelpCategories = () => apiRequest<HelpCategory[]>('/aide');
export const createHelpCategory = (payload: HelpPayload, token: string) => write<HelpCategory>('/aide/categories', 'POST', token, payload);
export const updateHelpCategory = (id: number, payload: HelpPayload, token: string) => write<HelpCategory>(`/aide/categories/${id}`, 'PUT', token, payload);
export const deleteHelpCategory = (id: number, token: string) => write<{ success: boolean }>(`/aide/categories/${id}`, 'DELETE', token);
export const createHelpQuestion = (categorieId: number, payload: HelpPayload, token: string) => write<HelpQuestion>('/aide/questions', 'POST', token, { categorieId, ...payload });
export const updateHelpQuestion = (id: number, payload: HelpPayload, token: string) => write<HelpQuestion>(`/aide/questions/${id}`, 'PUT', token, payload);
export const deleteHelpQuestion = (id: number, token: string) => write<{ success: boolean }>(`/aide/questions/${id}`, 'DELETE', token);
