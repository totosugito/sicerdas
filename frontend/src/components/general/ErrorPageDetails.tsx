import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowLeft, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorPageDetailsProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  onRetry?: () => void;
  onBack?: () => void;
  retryLabel?: string;
  backLabel?: string;
  className?: string;
  iconClassName?: string;
  variant?: "destructive" | "warning" | "info";
}

export const ErrorPageDetails = ({
  icon: Icon,
  title,
  description,
  onRetry,
  onBack,
  retryLabel,
  backLabel,
  className,
  iconClassName,
  variant = "destructive",
}: ErrorPageDetailsProps) => {
  const variantClasses = {
    destructive: "bg-destructive/10 text-destructive blur-bg-destructive/20",
    warning:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 blur-bg-amber-500/20",
    info: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 blur-bg-blue-500/20",
  };

  const blurColor =
    variant === "destructive"
      ? "bg-destructive/10 dark:bg-destructive/20"
      : variant === "warning"
        ? "bg-amber-500/10 dark:bg-amber-500/20"
        : "bg-blue-500/10 dark:bg-blue-500/20";

  return (
    <div
      className={cn(
        "flex min-h-[80vh] w-full flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500",
        className,
      )}
    >
      <div className="max-w-md space-y-8">
        <div className="relative flex justify-center">
          {/* Background decoration */}
          <div
            className={cn(
              "absolute inset-0 transform scale-150 rounded-full blur-3xl opacity-50",
              blurColor,
            )}
          />

          <div className="relative rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            {Icon && (
              <Icon
                className={cn(
                  "h-12 w-12",
                  variant === "destructive"
                    ? "text-destructive fill-destructive/5 dark:fill-destructive/20"
                    : "text-current",
                  iconClassName,
                )}
              />
            )}
          </div>
        </div>

        <div className="relative space-y-3">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          {description && <p className="font-medium text-muted-foreground">{description}</p>}
        </div>

        <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="gap-2 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <RefreshCcw className="h-5 w-5" />
              {retryLabel || "Retry"}
            </Button>
          )}
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-2 px-8 text-base transition-all hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
              {backLabel || "Back"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
