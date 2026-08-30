import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { nombre: string; rol: string } | null;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Simulado en true para desarrollo
  user: { nombre: 'Admin Mock', rol: 'ADMIN' },
  login: () =>
    set({
      isAuthenticated: true,
      user: { nombre: 'Admin Mock', rol: 'ADMIN' },
    }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
