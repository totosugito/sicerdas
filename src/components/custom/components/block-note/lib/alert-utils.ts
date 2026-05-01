import { Info, AlertTriangle, CheckCircle2, XCircle, LucideIcon } from "lucide-react";

export type AlertType = "info" | "warning" | "success" | "error";

export interface AlertConfig {
  id: AlertType;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const alertTypes: AlertConfig[] = [
  {
    id: "info",
    label: "Info",
    icon: Info,
    color: "blue",
  },
  {
    id: "warning",
    label: "Warning",
    icon: AlertTriangle,
    color: "amber",
  },
  {
    id: "success",
    label: "Success",
    icon: CheckCircle2,
    color: "green",
  },
  {
    id: "error",
    label: "Error",
    icon: XCircle,
    color: "red",
  },
];

export const getAlertStyles = (type: AlertType) => {
  const styles = {
    info: {
      wrapper: "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-100",
      icon: "text-blue-500",
    },
    warning: {
      wrapper: "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-100",
      icon: "text-amber-500",
    },
    success: {
      wrapper: "bg-green-500/10 border-green-500/20 text-green-900 dark:text-green-100",
      icon: "text-green-500",
    },
    error: {
      wrapper: "bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-100",
      icon: "text-red-500",
    },
  };

  return {
    ...(styles[type] || styles.info),
    iconSize: 24,
    iconClassName: "w-6 h-6",
  };
};
