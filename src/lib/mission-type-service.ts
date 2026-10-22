import { apiRequest } from './api';

export type MissionTypeRecord = { id: number; nom: string };

export const getMissionTypes = () => apiRequest<MissionTypeRecord[]>('/mission-types');

export const createMissionType = (nom: string, token: string) => apiRequest<MissionTypeRecord>('/mission-types', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ nom }),
});

export const updateMissionType = (id: number, nom: string, token: string) => apiRequest<MissionTypeRecord>(`/mission-types/${id}`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ nom }),
});

export const deleteMissionType = (id: number, token: string) => apiRequest<{ success: boolean }>(`/mission-types/${id}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});
