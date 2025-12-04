import {create} from "zustand/index";
import {APP_CONFIG} from "@/constants/config";
import {persist} from "zustand/middleware";
import { EnumPeriodicViewMode, EnumViewMode } from "@/constants/app-enum";

type ViewMode = (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"];
type PeriodicViewMode = (typeof EnumPeriodicViewMode)[keyof typeof EnumPeriodicViewMode]["value"];

type Store = {
  books: {
    viewMode: ViewMode;
    limit: number;
  },
  setBooks: (books: any) => void;

  periodicTable: {
    viewMode: PeriodicViewMode;
  },
  setPeriodicTable: (periodicTable: any) => void;

  resetAll: () => void;
}

export const defaultStore = {
  books: {
    viewMode: EnumViewMode.grid.value,
    limit: 12,
  },
  periodicTable: {
    viewMode: EnumPeriodicViewMode.theme1.value,
  },
  
}

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      books: defaultStore.books,
      setBooks: (books: any) => set({
        books
      }),

      periodicTable: defaultStore.periodicTable,
      setPeriodicTable: (periodicTable: any) => set({
        periodicTable
      }),

      resetAll: () => set({
        books: defaultStore.books,
        periodicTable: defaultStore.periodicTable,
      }),
    }),
    {
      name: `${APP_CONFIG.prefixStore}-app`, // single storage key
    }
  )
);