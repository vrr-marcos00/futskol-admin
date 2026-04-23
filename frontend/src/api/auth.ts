import { api } from './client';
import type { User } from '@/types/domain';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResult>('/auth/login', payload).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};
