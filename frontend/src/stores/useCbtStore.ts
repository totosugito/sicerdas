import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CbtFontSize = "sm" | "base" | "lg" | "xl";

interface CbtState {
  sessionId: string | null;
  elapsedSeconds: number;
  activeQuestionId: string | null;
  isSaving: boolean;
  connectionError: boolean;
  isTimerActive: boolean;
  draftOptionId: string | null;
  fontSize: CbtFontSize;

  setSessionId: (id: string | null) => void;
  setElapsedSeconds: (seconds: number) => void;
  incrementElapsedSeconds: () => void;
  setActiveQuestionId: (id: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setConnectionError: (error: boolean) => void;
  setIsTimerActive: (active: boolean) => void;
  setDraftOptionId: (id: string | null) => void;
  setFontSize: (size: CbtFontSize) => void;
  resetAll: () => void;
}

const defaultState = {
  sessionId: null,
  elapsedSeconds: 0,
  activeQuestionId: null,
  isSaving: false,
  connectionError: false,
  isTimerActive: true,
  draftOptionId: null,
  fontSize: "base" as CbtFontSize,
};

export const useCbtStore = create<CbtState>()(
  persist(
    (set) => ({
      ...defaultState,

      setSessionId: (id) => set({ sessionId: id }),
      setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
      incrementElapsedSeconds: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
      setActiveQuestionId: (id) => set({ activeQuestionId: id }),
      setIsSaving: (isSaving) => set({ isSaving }),
      setConnectionError: (error) => set({ connectionError: error }),
      setIsTimerActive: (active) => set({ isTimerActive: active }),
      setDraftOptionId: (id) => set({ draftOptionId: id }),
      setFontSize: (size) => set({ fontSize: size }),
      resetAll: () => set(defaultState),
    }),
    {
      name: "cbt-session-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
