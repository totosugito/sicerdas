import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ExamPackage } from "@/api/exam-packages/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { Clock, HelpCircle, Star, Bookmark, Eye } from "lucide-react";

interface ExamCardProps {
  exams: ExamPackage[];
  viewMode: "grid" | "list";
}

export const ExamCard = ({ exams, viewMode }: ExamCardProps) => {
  const { openSideMenu } = useAuthStore();

  const gridClass =
    viewMode === "grid"
      ? openSideMenu
        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      : "grid grid-cols-1 gap-4";

  return (
    <div className={gridClass}>
      {exams.map((exam) => (
        <ExamCardView key={exam.id} exam={exam} viewMode={viewMode} />
      ))}
    </div>
  );
};

interface ExamCardViewProps {
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

const ExamCardView = ({ exam, viewMode }: ExamCardViewProps) => {
  const { t } = useAppTranslation();
  const isListView = viewMode === "list";
  const navigate = useNavigate();

  const slug = exam.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const handleExamClick = () => {
    navigate({
      to: AppRoute.exam.packages.detail.url,
      params: { id: `${exam.id}-${slug}` },
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
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge
            className={cn(
              getGradeColor(exam.grade.name),
              "text-white border-0 shadow-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            )}
          >
            {exam.grade.name}
          </Badge>
          {exam.isNew && (
            <Badge
              variant="destructive"
              className="animate-pulse shadow-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-0"
            >
              {t(($) => $.exam.form.preview.new)}
            </Badge>
          )}
        </div>

        {/* Category Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-xs font-medium backdrop-blur-sm bg-white/10 px-2 py-1 rounded">
            {exam.category.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
            {exam.category.name}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className={cn("w-3.5 h-3.5", exam.stats.rating > 0 ? "fill-current" : "")} />
            <span className="text-xs font-bold">{exam.stats.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3
          className={cn(
            "font-extrabold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors duration-300",
            isListView ? "text-xl line-clamp-2" : "text-base line-clamp-2",
          )}
        >
          <Link
            to={AppRoute.exam.packages.detail.url}
            params={{ id: `${exam.id}-${slug}` }}
            className="cursor-pointer"
          >
            {exam.title}
          </Link>
        </h3>

        {isListView && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 hidden sm:block">
            {exam.description || t(($) => $.exam.description)}
          </p>
        )}

        {/* Stats Row */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {exam.stats.totalQuestions} {t(($) => $.exam.table.columns.questions)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{exam.durationMinutes}m</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden"
                >
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="w-3 h-3 text-primary/40" />
                  </div>
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">+{exam.stats.viewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
