import { create } from "zustand";
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
  examPackages: {
    viewMode: "table" | "card";
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search: string;
  };
  setExamPackages: (examPackages: any) => void;
  examSections: {
    viewMode: "table" | "card";
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search: string;
  };
  setExamSections: (examSections: any) => void;
  examPassages: {
    viewMode: "table" | "card";
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search: string;
  };
  setExamPassages: (examPassages: any) => void;
  examQuestions: {
    viewMode: "table" | "card";
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search: string;
  };
  setExamQuestions: (examQuestions: any) => void;

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
  examPackages: {
    viewMode: "table" as "table" | "card",
    limit: 10,
    sortBy: "updatedAt",
    sortOrder: "desc" as "asc" | "desc",
    search: "",
  },
  examSections: {
    viewMode: "table" as "table" | "card",
    limit: 10,
    sortBy: "order",
    sortOrder: "asc" as "asc" | "desc",
    search: "",
  },
  examPassages: {
    viewMode: "table" as "table" | "card",
    limit: 10,
    sortBy: "updatedAt",
    sortOrder: "desc" as "asc" | "desc",
    search: "",
  },
  examQuestions: {
    viewMode: "table" as "table" | "card",
    limit: 10,
    sortBy: "updatedAt",
    sortOrder: "desc" as "asc" | "desc",
    search: "",
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
      examPackages: defaultStore.examPackages,
      setExamPackages: (examPackages: any) =>
        set({
          examPackages,
        }),
      examSections: defaultStore.examSections,
      setExamSections: (examSections: any) =>
        set({
          examSections,
        }),
      examPassages: defaultStore.examPassages,
      setExamPassages: (examPassages: any) =>
        set({
          examPassages,
        }),
      examQuestions: defaultStore.examQuestions,
      setExamQuestions: (examQuestions: any) =>
        set({
          examQuestions,
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
          examPackages: defaultStore.examPackages,
          examSections: defaultStore.examSections,
          examPassages: defaultStore.examPassages,
          examQuestions: defaultStore.examQuestions,
        }),
    }),
    {
      name: `${APP_CONFIG.prefixStore}-app`, // single storage key
    },
  ),
);
