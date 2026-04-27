"use client";

import * as React from "react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, XCircle, HelpCircle, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export type DialogInfoItem = {
  text: string;
  icon?: React.ReactNode;
};

export type ModalProps = {
  title: string;
  desc?: React.ReactNode;
  content?: React.ReactNode;
  textConfirm?: string;
  textCancel?: string;
  onConfirmClick?: () => void;
  onCancelClick?: () => void;
  modal?: boolean;
  icon?: React.ReactNode;
  iconType?: "warning" | "success" | "info" | "error" | "question";
  showCloseButton?: boolean;
  variant?: "default" | "destructive";
  headerIcon?: React.ReactNode;
  headerIconBgColor?: string;
  infoTitle?: string;
  infoItems?: DialogInfoItem[];
  showInfoSection?: boolean;
  infoContainer?: string;
  infoContainerVariant?: "warning" | "success" | "info" | "error" | "default";
  infoContainerClassName?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

export type DialogModalProps = {
  modal?: ModalProps;
  className?: string;
  classNameContent?: string;
  classNameConfirm?: string;
  classNameCancel?: string;
  classNameHeader?: string;
  classNameBody?: string;
  classNameInfoSection?: string;
  variantSubmit?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  variantCancel?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "subtle-destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
};

const THEMES = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    infoClass: "border-amber-500/20 bg-amber-500/5",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    infoClass: "border-emerald-500/20 bg-emerald-500/5",
  },
  error: {
    icon: XCircle,
    iconColor: "text-destructive",
    bg: "bg-destructive/10",
    infoClass: "border-destructive/20 bg-destructive/5",
  },
  question: {
    icon: HelpCircle,
    iconColor: "text-accent-foreground",
    bg: "bg-accent/50",
    infoClass: "border-primary/20 bg-primary/5",
  },
  info: {
    icon: Info,
    iconColor: "text-primary",
    bg: "bg-primary/10",
    infoClass: "border-primary/20 bg-primary/5",
  },
  default: {
    icon: Info,
    iconColor: "text-primary",
    bg: "bg-primary/10",
    infoClass: "border-primary/20 bg-primary/5",
  },
};

const MAX_WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function DialogModal({
  modal,
  className,
  classNameContent,
  classNameConfirm,
  classNameCancel,
  classNameHeader,
  classNameBody,
  classNameInfoSection,
  variantSubmit = "default",
  variantCancel = "outline",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  children,
}: DialogModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(true);

  const config = {
    title: "Notification",
    desc: "This is a notification message.",
    textConfirm: "OK",
    textCancel: "Cancel",
    iconType: "info" as const,
    maxWidth: "sm" as const,
    ...modal,
  };

  const isOpen = controlledOpen ?? uncontrolledOpen;
  const setIsOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && config.onCancelClick) config.onCancelClick();
  };

  const theme = THEMES[config.iconType] || THEMES.info;
  const isDestructive = config.variant === "destructive";

  // Choose icon: explicit icon prop -> THEME icon with THEME color
  const ThemeIcon = theme.icon;
  const finalIcon = config.icon || <ThemeIcon className={cn("h-6 w-6", theme.iconColor)} />;

  // Choose background: explicit prop -> theme default
  const headerIconBg = config.headerIconBgColor || theme.bg;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

      <AlertDialogContent
        className={cn(
          MAX_WIDTH_MAP[config.maxWidth],
          "p-0 overflow-hidden shadow-2xl",
          classNameContent,
          className,
        )}
      >
        {/* Close Button */}
        {config.showCloseButton && (
          <button
            onClick={() => handleOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        {/* Header Section */}
        <div className={cn("px-6 pt-6 pb-2 text-center", classNameHeader)}>
          <div
            className={cn(
              "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
              headerIconBg,
            )}
          >
            {finalIcon}
          </div>
          <AlertDialogTitle className="text-foreground text-xl font-bold tracking-tight">
            {config.title}
          </AlertDialogTitle>
          {config.desc && (
            <AlertDialogDescription className="text-muted-foreground mt-2 text-base leading-relaxed">
              {config.desc}
            </AlertDialogDescription>
          )}
        </div>

        {/* Body Content */}
        <div className={cn("px-6 pb-5 space-y-4", classNameBody)}>
          {config.content && <div className="w-full">{config.content}</div>}

          {/* Simple Info Banner */}
          {config.infoContainer && (
            <div
              className={cn(
                "rounded-lg border p-3.5 text-center transition-all",
                THEMES[(config.infoContainerVariant || "info") as keyof typeof THEMES]?.infoClass ||
                  THEMES.info.infoClass,
                config.infoContainerClassName,
                classNameInfoSection,
              )}
            >
              <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                {config.infoContainer}
              </p>
            </div>
          )}

          {/* Detailed Info List */}
          {config.showInfoSection && config.infoItems && config.infoItems.length > 0 && (
            <div
              className={cn(
                "rounded-lg border border-border bg-secondary/30 p-4 space-y-2.5",
                classNameInfoSection,
              )}
            >
              {config.infoTitle && (
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {config.infoTitle}
                </p>
              )}
              <div className="space-y-2">
                {config.infoItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 text-sm text-foreground/80 leading-snug"
                  >
                    {item.icon || (
                      <div
                        className={cn(
                          "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
                          isDestructive ? "bg-destructive" : "bg-primary",
                        )}
                      />
                    )}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {children}

          {/* Action Buttons */}
          <AlertDialogFooter className="flex-row gap-3 sm:justify-stretch pt-4">
            {config.textCancel && (
              <AlertDialogCancel
                className={cn(
                  buttonVariants({ variant: variantCancel }),
                  "flex-1 h-10 border-slate-200 dark:border-slate-800",
                  classNameCancel,
                )}
                onClick={config.onCancelClick}
              >
                {config.textCancel}
              </AlertDialogCancel>
            )}
            {config.textConfirm && (
              <AlertDialogAction
                className={cn(
                  buttonVariants({ variant: variantSubmit }),
                  "flex-1 h-10 shadow-lg transition-all",
                  variantSubmit === "default" && !isDestructive && "shadow-primary/20",
                  isDestructive && "shadow-destructive/20",
                  classNameConfirm,
                )}
                onClick={config.onConfirmClick}
              >
                {config.textConfirm}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
