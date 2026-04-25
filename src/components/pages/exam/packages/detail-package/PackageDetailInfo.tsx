import { ExamPackage } from "@/api/exam-packages";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Clock, HelpCircle, LayoutGrid, LucideIcon, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageDetailInfoProps {
  pkg: ExamPackage;
}

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  colorClass?: string;
}

const InfoCard = ({ icon: Icon, label, value, colorClass }: InfoCardProps) => (
  <div className="group flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 sm:p-5">
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
        colorClass || "bg-muted group-hover:bg-primary/10",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          colorClass ? "text-current" : "text-muted-foreground group-hover:text-primary",
        )}
      />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  </div>
);

export const PackageDetailInfo = ({ pkg }: PackageDetailInfoProps) => {
  const { t } = useAppTranslation();

  return (
    <div className="flex flex-col gap-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard
          icon={LayoutGrid}
          label={t(($) => $.exam.sections.title)}
          value={`${pkg.stats.totalSections} Seksi`}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <InfoCard
          icon={HelpCircle}
          label={t(($) => $.exam.questions.testQuestions)}
          value={`${pkg.stats.totalQuestions} Soal`}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
        />
        <InfoCard
          icon={Clock}
          label={t(($) => $.exam.packages.form.durationMinutes.label)}
          value={`${pkg.durationMinutes} Menit`}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        />
        <InfoCard
          icon={Calendar}
          label={t(($) => $.labels.addedOn)}
          value={new Date(pkg.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          colorClass="bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400"
        />
      </div>

      {/* Description Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-primary" />
          <h3 className="text-lg font-bold tracking-tight">{t(($) => $.labels.description)}</h3>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="leading-relaxed text-muted-foreground">
            {pkg.description || t(($) => $.exam.packages.detail.noDescription)}
          </p>
        </div>
      </div>
    </div>
  );
};
