import { api } from './client';
import type { Injury } from '@/types/domain';

export interface InjuryStartPayload {
  startDate: string;
  notes?: string | null;
}

export interface InjuryClosePayload {
  endDate: string;
  notes?: string | null;
}

export interface InjuryFilters {
  active?: boolean;
  playerId?: string;
}

export const injuriesApi = {
  list: (filters: InjuryFilters = {}) =>
    api.get<Injury[]>('/injuries', { params: filters }).then((r) => r.data),
  listByPlayer: (playerId: string) =>
    api.get<Injury[]>(`/players/${playerId}/injuries`).then((r) => r.data),
  start: (playerId: string, payload: InjuryStartPayload) =>
    api.post<Injury>(`/players/${playerId}/injuries`, payload).then((r) => r.data),
  close: (playerId: string, injuryId: string, payload: InjuryClosePayload) =>
    api
      .post<Injury>(`/players/${playerId}/injuries/${injuryId}/close`, payload)
      .then((r) => r.data),
};
