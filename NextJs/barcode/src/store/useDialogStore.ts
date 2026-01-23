import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type DialoStore = {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const useDialogStore = create<DialoStore>()(
  persist(
    (set) => ({
      isOpen: false,
      openDialog: () => set({ isOpen: true }),
      closeDialog: () => set({ isOpen: false }),
    }),
    {
      name: "dialog-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used. [sessionStorage,localStorage]
    }
  )
);

/* with out persist */
// const useDialogStore = create<DialoStore>((set) => ({
//   isOpen: false,
//   openDialog: () => set({ isOpen: true }),
//   closeDialog: () => set({ isOpen: false }),
// }));

export default useDialogStore;
