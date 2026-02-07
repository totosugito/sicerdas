import { create } from "zustand/index";
import { APP_CONFIG } from "@/constants/config";
import { persist } from "zustand/middleware";
import { EnumPeriodicViewMode, EnumViewMode } from "@/constants/app-enum";

type ViewMode = (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"];
type PeriodicViewMode = (typeof EnumPeriodicViewMode)[keyof typeof EnumPeriodicViewMode]["value"];

type Store = {
  books: {
    viewMode: ViewMode;
    limit: number;
    page: number;
    search: string;
    category: number[];
    group: number[];
    grade: number[];
    sortBy: string;
    sortOrder: "asc" | "desc";
  },
  setBooks: (books: any) => void;

  periodicTable: {
    viewMode: PeriodicViewMode;
  },
  setPeriodicTable: (periodicTable: any) => void;

  elementExpandedSections: Record<string, boolean>;
  setElementExpandedSection: (section: string, expanded: boolean) => void;
  resetElementExpandedSections: () => void;

  resetAll: () => void;
}

export const defaultStore = {
  books: {
    viewMode: EnumViewMode.grid.value,
    limit: 12,
    page: 1,
    search: '',
    category: [-1],
    group: [] as number[],
    grade: [] as number[],
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  },
  periodicTable: {
    viewMode: EnumPeriodicViewMode.theme1.value,
  },
  elementExpandedSections: {
    overview: true,
    notes: true,
    classifications: true,
    atomicDimensions: true,
    thermalProperties: true,
    bulkPhysical: true,
    electrical: true,
    magnetic: true,
    abundances: true,
    reactivity: true,
    healthSafety: true,
    nuclear: true
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

      elementExpandedSections: defaultStore.elementExpandedSections,
      setElementExpandedSection: (section: string, expanded: boolean) => set((state) => ({
        elementExpandedSections: {
          ...state.elementExpandedSections,
          [section]: expanded
        }
      })),
      resetElementExpandedSections: () => set({
        elementExpandedSections: defaultStore.elementExpandedSections
      }),

      resetAll: () => set({
        books: defaultStore.books,
        periodicTable: defaultStore.periodicTable,
        elementExpandedSections: defaultStore.elementExpandedSections
      }),
    }),
    {
      name: `${APP_CONFIG.prefixStore}-app`, // single storage key
    }
  )
);