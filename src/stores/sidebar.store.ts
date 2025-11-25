import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  // State
  open: boolean;
  openMobile: boolean;

  // Actions
  setOpen: (open: boolean) => void;
  setOpenMobile: (openMobile: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const SIDEBAR_DEFAULT_OPEN = true;

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      open: SIDEBAR_DEFAULT_OPEN,
      openMobile: false,

      setOpen: (open) => set({ open }),

      setOpenMobile: (openMobile) => set({ openMobile }),

      toggleSidebar: () => set((state) => ({ open: !state.open })),

      toggleMobileSidebar: () => set((state) => ({ openMobile: !state.openMobile })),
    }),
    {
      name: "sidebar-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        open: state.open,
        // Don't persist mobile state as it should always start closed
      }),
    }
  )
);

/**
 * Selector hooks for better performance
 */
export const useSidebarOpen = () => useSidebarStore((state) => state.open);
export const useSidebarOpenMobile = () => useSidebarStore((state) => state.openMobile);
