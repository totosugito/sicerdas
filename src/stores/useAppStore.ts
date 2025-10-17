import {create} from "zustand/index";
import {APP_CONFIG} from "@/constants/config";
import {persist} from "zustand/middleware";
import { EnumViewMode } from "@/constants/app-enum";

type ViewMode = (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"];

type Store = {
  books: {
    viewMode: ViewMode;
    limit: number;
  },
  setBooks: (books: any) => void;

  resetAll: () => void;
}

export const defaultStore = {
  books: {
    viewMode: EnumViewMode.grid.value,
    limit: 12,
  },
}

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      books: defaultStore.books,
      setBooks: (books: any) => set({
        books
      }),

      resetAll: () => set({
        books: defaultStore.books
      }),
    }),
    {
      name: `${APP_CONFIG.prefixStore}-app`, // single storage key
    }
  )
);