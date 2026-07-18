import { ExamPackage } from "@/api/exam/packages";
import { EnumExamPackageUserStatus } from "backend/src/db/schema/exam/enums";
import { Progress } from "@/components/ui/progress";
import { useAppTranslation } from "@/lib/i18n-typed";
import { LayoutGrid, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageDetailProgressProps {
  pkg: ExamPackage;
}

export const PackageDetailProgress = ({ pkg }: PackageDetailProgressProps) => {
  const { t } = useAppTranslation();

  if (
    !pkg.userInteraction?.status ||
    pkg.userInteraction.status === EnumExamPackageUserStatus.NOT_STARTED
  ) {
    return null;
  }

  const isCompleted = pkg.userInteraction.status === EnumExamPackageUserStatus.COMPLETED;

  const percentage = Math.round(
    ((pkg.userInteraction?.completedSectionsCount || 0) / pkg.stats.activeSections) * 100,
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 transition-all duration-300",
        isCompleted
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
          : "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isCompleted
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <LayoutGrid className="h-5 w-5 animate-pulse" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <h3
                className={cn(
                  "text-sm font-bold uppercase tracking-tight",
                  isCompleted
                    ? "text-emerald-900 dark:text-emerald-100"
                    : "text-amber-900 dark:text-amber-100",
                )}
              >
                {isCompleted
                  ? t(($) => $.exam.packages.userStatus.completed)
                  : t(($) => $.exam.packages.userStatus.inProgress)}
              </h3>
              <p
                className={cn(
                  "text-xs font-medium opacity-70",
                  isCompleted
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400",
                )}
              >
                {t(($) => $.exam.packages.userStatus.sectionsCompletedHero, {
                  completed: pkg.userInteraction?.completedSectionsCount || 0,
                  total: pkg.stats.activeSections,
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={cn(
                "text-lg font-black",
                isCompleted
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400",
              )}
            >
              {percentage}%
            </span>
          </div>
        </div>
        <Progress
          value={percentage}
          className={cn(
            "h-2 rounded-full",
            isCompleted
              ? "bg-emerald-200 dark:bg-emerald-900/40"
              : "bg-amber-200 dark:bg-amber-900/40",
          )}
          indicatorClassName={isCompleted ? "bg-emerald-500" : "bg-amber-500"}
        />
      </div>
    </div>
  );
};
