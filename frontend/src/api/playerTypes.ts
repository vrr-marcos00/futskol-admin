import { api } from './client';
import type { PlayerType } from '@/types/domain';

export interface PlayerTypePayload {
  name: string;
  monthlyFee: number;
  monthlyLimit?: number | null;
  active?: boolean;
}

export const playerTypesApi = {
  list: (active?: boolean) =>
    api.get<PlayerType[]>('/player-types', { params: active == null ? {} : { active } })
      .then((r) => r.data),
  create: (payload: PlayerTypePayload) =>
    api.post<PlayerType>('/player-types', payload).then((r) => r.data),
  update: (id: string, payload: PlayerTypePayload) =>
    api.put<PlayerType>(`/player-types/${id}`, payload).then((r) => r.data),
};
