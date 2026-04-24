import { api } from './client';
import type { Player } from '@/types/domain';

export interface PlayerPayload {
  name: string;
  cpf?: string | null;
  phone?: string | null;
  playerTypeId: string;
  active?: boolean;
  notes?: string | null;
}

export interface PlayerFilters {
  active?: boolean;
  typeId?: string;
  search?: string;
}

export const playersApi = {
  list: (filters: PlayerFilters = {}) =>
    api.get<Player[]>('/players', { params: filters }).then((r) => r.data),
  create: (payload: PlayerPayload) =>
    api.post<Player>('/players', payload).then((r) => r.data),
  update: (id: string, payload: PlayerPayload) =>
    api.put<Player>(`/players/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/players/${id}`),
};
