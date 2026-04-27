import { EnumExamSessionStatus } from "backend/src/db/schema/exam/enums";
import { CheckCircle2, PlayCircle, FileText } from "lucide-react";

export { EnumExamSessionStatus } from "backend/src/db/schema/exam/enums";

export const ExamSessionStatusConfig = {
  [EnumExamSessionStatus.COMPLETED]: {
    variant: "success" as const,
    icon: CheckCircle2,
    labelKey: "exam.sessions.status.completed" as const,
    animate: false,
    iconClassName: "text-success group-hover:text-primary",
  },
  [EnumExamSessionStatus.IN_PROGRESS]: {
    variant: "warning" as const,
    icon: PlayCircle,
    labelKey: "exam.sessions.status.inProgress" as const,
    animate: true,
    iconClassName: "text-warning group-hover:text-primary",
  },
  [EnumExamSessionStatus.ABANDONED]: {
    variant: "secondary" as const,
    icon: FileText,
    labelKey: "exam.sessions.status.abandoned" as const,
    animate: false,
    iconClassName: "text-muted-foreground group-hover:text-primary",
  },
};

export const CurrencyList = {
  IDR: {
    symbol: "Rp",
    value: "IDR",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  USD: {
    symbol: "$",
    value: "USD",
    textColor: "text-purple-600 dark:text-purple-400",
  },
};

export const EnumViewMode = {
  grid: {
    value: "grid",
    label: "Grid",
  },
  list: {
    value: "list",
    label: "List",
  },
  table: {
    value: "table",
    label: "Table",
  },
  card: {
    value: "card",
    label: "Card",
  },
  gantt: {
    value: "gantt",
    label: "Gantt",
  },
  details: {
    value: "details",
    label: "Details",
  },
} as const;

export const EnumPeriodicViewMode = {
  theme1: {
    value: "theme1",
    label: "Theme 1",
  },
  theme2: {
    value: "theme2",
    label: "Theme 2",
  },
  theme3: {
    value: "theme3",
    label: "Theme 3",
  },
  theme4: {
    value: "theme4",
    label: "Theme 4",
  },
};

export const durationOnMinutes = [
  { label: "0", value: "0" },
  { label: "15", value: "15" },
  { label: "20", value: "20" },
  { label: "30", value: "30" },
  { label: "60", value: "60" },
];
