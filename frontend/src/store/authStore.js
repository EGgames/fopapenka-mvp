import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      nickname: null,
      role: null,
      penca: null,
      setAuth: ({ token, nickname, role, penca }) => set({ token, nickname, role, penca }),
      logout: () => set({ token: null, nickname: null, role: null, penca: null }),
    }),
    { name: 'fopapenka-auth' }
  )
);
