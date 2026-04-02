import { create } from "zustand/index";
import { APP_CONFIG } from "@/constants/config";
import { persist } from "zustand/middleware";
import { EnumPeriodicViewMode, EnumViewMode } from "@/constants/app-enum";
import { JsonQuestionImport } from "@/api/exam-questions/types";

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
  };
  setBooks: (books: any) => void;

  periodicTable: {
    viewMode: PeriodicViewMode;
  };
  setPeriodicTable: (periodicTable: any) => void;

  elementExpandedSections: Record<string, boolean>;
  setElementExpandedSection: (section: string, expanded: boolean) => void;
  resetElementExpandedSections: () => void;

  mobileMenu: Record<string, boolean>;
  setMobileMenuExpanded: (id: string, expanded: boolean) => void;

  jsonQuestions: JsonQuestionImport[];
  setJsonQuestions: (questions: JsonQuestionImport[]) => void;

  jsonQuestionsGlobalParams: {
    subjectId: string;
    passageId: string | null;
    difficulty: string;
    type: string;
    requiredTier: string;
    educationGradeId: string | number | null;
  };
  setJsonQuestionsGlobalParams: (params: any) => void;
  jsonQuestionsPackageParams: {
    packageId: string | null;
    sectionId: string | null;
  };
  setJsonQuestionsPackageParams: (params: any) => void;

  resetAll: () => void;
};

export const defaultStore = {
  books: {
    viewMode: EnumViewMode.grid.value,
    limit: 12,
    page: 1,
    search: "",
    category: [0],
    group: [] as number[],
    grade: [] as number[],
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
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
    nuclear: true,
  },
  mobileMenu: {} as Record<string, boolean>,
  jsonQuestions: [] as JsonQuestionImport[],
  jsonQuestionsGlobalParams: {
    subjectId: "",
    passageId: null,
    difficulty: "medium",
    type: "multiple_choice",
    requiredTier: "free",
    educationGradeId: "",
  },
  jsonQuestionsPackageParams: {
    packageId: null,
    sectionId: null,
  },
};

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      books: defaultStore.books,
      setBooks: (books: any) =>
        set({
          books,
        }),

      periodicTable: defaultStore.periodicTable,
      setPeriodicTable: (periodicTable: any) =>
        set({
          periodicTable,
        }),

      elementExpandedSections: defaultStore.elementExpandedSections,
      setElementExpandedSection: (section: string, expanded: boolean) =>
        set((state) => ({
          elementExpandedSections: {
            ...state.elementExpandedSections,
            [section]: expanded,
          },
        })),
      resetElementExpandedSections: () =>
        set({
          elementExpandedSections: defaultStore.elementExpandedSections,
        }),

      mobileMenu: defaultStore.mobileMenu,
      setMobileMenuExpanded: (id: string, expanded: boolean) =>
        set((state) => ({
          mobileMenu: {
            ...state.mobileMenu,
            [id]: expanded,
          },
        })),

      jsonQuestions: defaultStore.jsonQuestions,
      setJsonQuestions: (questions: JsonQuestionImport[]) => set({ jsonQuestions: questions }),

      jsonQuestionsGlobalParams: defaultStore.jsonQuestionsGlobalParams,
      setJsonQuestionsGlobalParams: (params: any) =>
        set({
          jsonQuestionsGlobalParams: params,
        }),
      jsonQuestionsPackageParams: defaultStore.jsonQuestionsPackageParams,
      setJsonQuestionsPackageParams: (params: any) =>
        set({
          jsonQuestionsPackageParams: params,
        }),

      resetAll: () =>
        set({
          books: defaultStore.books,
          periodicTable: defaultStore.periodicTable,
          elementExpandedSections: defaultStore.elementExpandedSections,
          mobileMenu: defaultStore.mobileMenu,
          jsonQuestions: defaultStore.jsonQuestions,
          jsonQuestionsGlobalParams: defaultStore.jsonQuestionsGlobalParams,
          jsonQuestionsPackageParams: defaultStore.jsonQuestionsPackageParams,
        }),
    }),
    {
      name: `${APP_CONFIG.prefixStore}-app`, // single storage key
    },
  ),
);
