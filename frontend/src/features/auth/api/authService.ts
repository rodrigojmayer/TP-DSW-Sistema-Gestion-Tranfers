import { apiFetch } from '../../../api/apiClient';
import type { Usuario } from '../../../types/index';

export interface LoginCredentials {
  identificador: string;
  password: string;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};