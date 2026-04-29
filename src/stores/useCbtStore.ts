import { create } from "zustand";

interface CbtState {
  elapsedSeconds: number;
  activeQuestionId: string | null;
  isSaving: boolean;
  connectionError: boolean;
  isTimerActive: boolean;
  draftOptionId: string | null;

  setElapsedSeconds: (seconds: number) => void;
  incrementElapsedSeconds: () => void;
  setActiveQuestionId: (id: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setConnectionError: (error: boolean) => void;
  setIsTimerActive: (active: boolean) => void;
  setDraftOptionId: (id: string | null) => void;
  resetAll: () => void;
}

const defaultState = {
  elapsedSeconds: 0,
  activeQuestionId: null,
  isSaving: false,
  connectionError: false,
  isTimerActive: true,
  draftOptionId: null,
};

export const useCbtStore = create<CbtState>((set) => ({
  ...defaultState,

  setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
  incrementElapsedSeconds: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  setActiveQuestionId: (id) => set({ activeQuestionId: id }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setConnectionError: (error) => set({ connectionError: error }),
  setIsTimerActive: (active) => set({ isTimerActive: active }),
  setDraftOptionId: (id) => set({ draftOptionId: id }),
  resetAll: () => set(defaultState),
}));
