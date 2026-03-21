import { create } from 'zustand';

export const useChatNotifStore = create((set, get) => ({
  unread: 0,
  toast: null,
  setUnread: (count) => set({ unread: count }),
  increment: () => set((s) => ({ unread: s.unread + 1 })),
  clear: () => set({ unread: 0 }),
  showToast: (data) => {
    set({ toast: data });
    setTimeout(() => {
      if (get().toast?.id === data.id) set({ toast: null });
    }, 5000);
  },
  hideToast: () => set({ toast: null }),
}));
