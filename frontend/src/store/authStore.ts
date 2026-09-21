import { create } from 'zustand';
import type { Usuario } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: Usuario | null;
  token: string | null;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
}

// Helper para recuperar la sesión guardada al recargar la página
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('usuario');

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,

  login: (user: Usuario, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(user));
    
    set({
      isAuthenticated: true,
      user,
      token,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  },
}));