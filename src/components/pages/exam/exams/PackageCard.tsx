import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ExamPackage } from "@/api/exam-packages/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { Heart, HelpCircle, Layers, CheckCircle2, PlayCircle } from "lucide-react";
import { EnumExamPackageUserStatus } from "backend/src/db/schema/exam/enums";
import { getGradeColor } from "@/lib/exam-utils";

interface PackageCardProps {
  exams: ExamPackage[];
  viewMode: "grid" | "list";
}

export const PackageCard = ({ exams, viewMode }: PackageCardProps) => {
  const { openSideMenu } = useAuthStore();

  const gridClass =
    viewMode === "grid"
      ? openSideMenu
        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 gap-4";

  return (
    <div className={gridClass}>
      {exams.map((exam) => (
        <PackageCardView key={exam.id} exam={exam} viewMode={viewMode} />
      ))}
    </div>
  );
};

interface PackageCardViewProps {
  exam: ExamPackage;
  viewMode: "grid" | "list";
}

const PackageCardView = ({ exam, viewMode }: PackageCardViewProps) => {
  const { t } = useAppTranslation();
  const isListView = viewMode === "list";
  const navigate = useNavigate();

  const handleExamClick = () => {
    navigate({
      to: AppRoute.exam.packages.detail.url,
      params: { id: exam.id },
    });
  };

  return (
    <div
      className={cn(
        "group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-primary/40 transition-all duration-500 overflow-hidden flex",
        isListView ? "flex-col sm:flex-row min-h-[180px]" : "flex-col h-full",
      )}
    >
      {/* Thumbnail Container */}
      <div
        onClick={handleExamClick}
        className={cn(
          "relative overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer shrink-0",
          isListView ? "w-full sm:w-64 aspect-video sm:aspect-[4/3]" : "aspect-video w-full",
        )}
      >
        {exam.thumbnail ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url("${exam.thumbnail}")` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700" />
          </div>
        )}

        {/* Grade Badge - Top Left (Essential) */}
        {exam.grade.name && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              className={cn(
                getGradeColor(exam.grade.name),
                "text-white rounded shadow-sm backdrop-blur-sm text-xs px-2 py-0.5 border-none font-medium",
              )}
            >
              {exam.grade.name}
            </Badge>
          </div>
        )}

        {/* Progress Bar - Minimalist and Premium */}
        {exam.userInteraction?.status === EnumExamPackageUserStatus.IN_PROGRESS && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 backdrop-blur-sm">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 ease-out"
              style={{
                width: `${(exam.userInteraction.completedSectionsCount / exam.stats.activeSections) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Completion Bar - Full width Green for finished exams */}
        {exam.userInteraction?.status === EnumExamPackageUserStatus.COMPLETED && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 shadow-[0_-2px_4px_rgba(34,197,94,0.3)]" />
        )}

        {/* New Badge - Top Right */}
        {exam.isNew && (
          <div className="absolute top-3 right-3 z-10">
            <span className="new-badge text-xs px-2 py-0.5 rounded shadow-sm bg-red-500 text-white font-bold animate-pulse">
              {t(($) => $.labels.new)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.15em]">
              {exam.category.name}
            </span>
            {/* Completion Indicator (Only for finished exams) */}
            {exam.userInteraction?.status === EnumExamPackageUserStatus.COMPLETED && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                {t(($) => $.exam.packages.userStatus.completed)}
              </span>
            )}
          </div>
          {exam.userInteraction?.bookmarked && (
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          )}
        </div>

        <h3
          className={cn(
            "font-extrabold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors duration-300",
            isListView ? "text-xl line-clamp-2" : "text-base line-clamp-2",
          )}
        >
          <Link
            to={AppRoute.exam.packages.detail.url}
            params={{ id: exam.id }}
            className="cursor-pointer"
          >
            {exam.title}
          </Link>
        </h3>

        {isListView && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 hidden sm:block">
            {exam.description}
          </p>
        )}

        {/* Info Grid */}
        <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {t(($) => $.exam.packages.table.columns.sections)}
            </span>
            <div className="flex items-center gap-1.5">
              <Layers
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  exam.userInteraction?.status === EnumExamPackageUserStatus.IN_PROGRESS
                    ? "text-amber-500 animate-pulse"
                    : "text-primary/60",
                )}
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  exam.userInteraction?.status === EnumExamPackageUserStatus.IN_PROGRESS
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                {exam.userInteraction?.status === EnumExamPackageUserStatus.IN_PROGRESS ||
                exam.userInteraction?.status === EnumExamPackageUserStatus.COMPLETED
                  ? `${exam.userInteraction.completedSectionsCount}/${exam.stats.activeSections}`
                  : exam.stats.activeSections}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {t(($) => $.exam.packages.table.columns.questions)}
            </span>
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {exam.stats.activeQuestions}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
