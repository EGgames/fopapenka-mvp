import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      nickname: null,
      role: null,
      penca: null,
      userId: null,
      setAuth: ({ token, nickname, role, penca }) => {
        let userId = null;
        try {
          userId = JSON.parse(atob(token.split('.')[1])).userId ?? null;
        } catch {}
        set({ token, nickname, role, penca, userId });
      },
      logout: () => set({ token: null, nickname: null, role: null, penca: null, userId: null }),
    }),
    { name: 'fopapenka-auth' }
  )
);
