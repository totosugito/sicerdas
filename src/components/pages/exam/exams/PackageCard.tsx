import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ExamPackage } from "@/api/exam-packages/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { Heart, HelpCircle, Layers } from "lucide-react";

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

const getGradeColor = (gradeName: string | null) => {
  if (!gradeName) return "bg-slate-500";
  const name = gradeName.toLowerCase();
  if (name.includes("sma") || name.includes("10") || name.includes("11") || name.includes("12"))
    return "bg-blue-600";
  if (name.includes("smp") || name.includes("7") || name.includes("8") || name.includes("9"))
    return "bg-emerald-600";
  if (
    name.includes("sd") ||
    name.includes("1") ||
    name.includes("2") ||
    name.includes("3") ||
    name.includes("4") ||
    name.includes("5") ||
    name.includes("6")
  )
    return "bg-orange-600";
  return "bg-slate-600";
};

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

        {/* Badges on overlay */}
        {exam.grade.name && (
          <div className="absolute top-3 left-3">
            <Badge
              className={cn(
                getGradeColor(exam.grade.name),
                "text-white rounded shadow-sm backdrop-blur-sm text-xs px-2 py-1 border-muted",
              )}
            >
              {exam.grade.name}
            </Badge>
          </div>
        )}

        {exam.isNew && (
          <div className="absolute top-3 right-3 z-10">
            <span className="new-badge animate-pulse">{t(($) => $.labels.new)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
            {exam.category.name}
          </span>
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t(($) => $.exam.packages.table.columns.sections)}
            </span>
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary/60 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {exam.stats.activeSections}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
