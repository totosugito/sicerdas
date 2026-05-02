import { EnumExamSessionMode } from "backend/src/db/schema/exam/enums";

export type ExamSessionMode = (typeof EnumExamSessionMode)[keyof typeof EnumExamSessionMode];
export const EnumExamStatus = {
  UNANSWERED: "unanswered",
  ANSWERED: "answered",
  DOUBTFUL: "doubtful",
  CORRECT: "correct",
  WRONG: "wrong",
  CORRECT_SOLID: "correct_solid",
  WRONG_SOLID: "wrong_solid",
  CORRECT_DASHED: "correct_dashed",
  WRONG_DASHED: "wrong_dashed",
  NEUTRAL: "neutral",
  ANSWERED_SOLID: "answered_solid",
} as const;

export type ExamStatus = (typeof EnumExamStatus)[keyof typeof EnumExamStatus];

export interface ExamStatusStyle {
  bg: string;
  text: string;
  border: string;
  active?: string;
  dot?: string;
  icon?: string;
  shadow?: string;
}

export const EXAM_STATUS_STYLES: Record<ExamStatus, ExamStatusStyle> = {
  [EnumExamStatus.UNANSWERED]: {
    bg: "bg-gray-100 dark:bg-slate-900",
    text: "text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
    dot: "bg-slate-200 dark:bg-slate-800",
    active: "bg-slate-500/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    icon: "text-slate-400"
  },
  [EnumExamStatus.ANSWERED]: {
    bg: "bg-primary/5 dark:bg-primary/10",
    text: "text-primary",
    border: "border-primary/40",
    dot: "bg-primary",
    active: "bg-primary/5 text-primary border-primary/20",
    icon: "text-primary"
  },
  [EnumExamStatus.DOUBTFUL]: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-500 dark:border-yellow-600",
    dot: "bg-yellow-400",
    active: "bg-yellow-500/5 text-yellow-700 dark:text-yellow-400 border-yellow-500/40",
    icon: "text-yellow-500"
  },
  [EnumExamStatus.CORRECT]: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500 dark:border-green-600",
    dot: "bg-green-500",
    active: "bg-green-500/5 text-green-700 dark:text-green-400 border-green-500/40",
    icon: "text-green-500"
  },
  [EnumExamStatus.WRONG]: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500 dark:border-red-600",
    dot: "bg-red-500",
    active: "bg-red-500/5 text-red-700 dark:text-red-400 border-red-500/40",
    icon: "text-red-500"
  },
  [EnumExamStatus.CORRECT_SOLID]: {
    bg: "bg-green-500 dark:bg-green-600",
    text: "text-white",
    border: "border-green-600 dark:border-green-700",
    shadow: "shadow-xl shadow-green-500/40",
    active: "bg-green-600 text-white border-green-700",
  },
  [EnumExamStatus.WRONG_SOLID]: {
    bg: "bg-red-500 dark:bg-red-600",
    text: "text-white",
    border: "border-red-600 dark:border-red-700",
    shadow: "shadow-xl shadow-red-500/40",
    active: "bg-red-600 text-white border-red-700",
  },
  [EnumExamStatus.CORRECT_DASHED]: {
    bg: "bg-transparent",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500 dark:border-green-600 border-dashed",
    shadow: "shadow-sm shadow-green-500/5",
  },
  [EnumExamStatus.WRONG_DASHED]: {
    bg: "bg-transparent",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500 dark:border-red-600 border-dashed",
    shadow: "shadow-sm shadow-red-500/5",
  },
  [EnumExamStatus.NEUTRAL]: {
    bg: "bg-white dark:bg-slate-900",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
    shadow: "shadow-sm shadow-slate-500/5",
  },
  [EnumExamStatus.ANSWERED_SOLID]: {
    bg: "bg-primary",
    text: "text-primary-foreground",
    border: "border-primary",
    shadow: "shadow-xl shadow-primary/40",
  },
};

export const EXAM_STATUS_GROUPS = {
  common: [EnumExamStatus.UNANSWERED, EnumExamStatus.ANSWERED] as ExamStatus[],
  tryout: [EnumExamStatus.DOUBTFUL] as ExamStatus[],
  study: [EnumExamStatus.CORRECT, EnumExamStatus.WRONG] as ExamStatus[],
};
