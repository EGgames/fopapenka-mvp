import { create } from 'zustand';

export const useChatNotifStore = create((set, get) => ({
  unread: 0,
  setUnread: (count) => set({ unread: count }),
  increment: () => set((s) => ({ unread: s.unread + 1 })),
  clear: () => set({ unread: 0 }),
}));
