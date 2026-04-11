import React from "react";
import { ExamPackage } from "@/api/exam-packages";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ImageIcon,
  CalendarDays,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { string_to_locale_date } from "@/lib/my-utils";
import { cn } from "@/lib/utils";

interface PackageCardListItemProps {
  pkg: ExamPackage;
  onDelete: (pkg: ExamPackage) => void;
}

export function PackageCardListItem({ pkg, onDelete }: PackageCardListItemProps) {
  const { t } = useAppTranslation();
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className="group relative flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden h-full">
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
        {pkg.thumbnail && !hasError ? (
          <img
            src={pkg.thumbnail}
            alt={pkg.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <ImageIcon className="h-12 w-12 text-primary/20" />
            {/* Abstract Pattern Fallback */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <svg width="100%" height="100%">
                <pattern
                  id={`pattern-pkg-${pkg.id}`}
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
                <rect width="100%" height="100%" fill={`url(#pattern-pkg-${pkg.id})`} />
              </svg>
            </div>
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge
            className={cn(
              "shadow-sm border-transparent",
              pkg.isActive
                ? "bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-600/20 dark:text-emerald-400 dark:border-emerald-500/30"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
            )}
          >
            {pkg.isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
          </Badge>

          {pkg.isNew && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-500/90 shadow-sm border-transparent animate-pulse whitespace-nowrap">
              {t(($) => $.labels.new)}
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 shadow-sm border border-border/40"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/60">
              <DropdownMenuLabel>{t(($) => $.labels.actions)}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to={AppRoute.exam.packages.admin.detail.url.replace("$id", pkg.id)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4 text-primary" />
                  {t(($) => $.exam.packages.table.actions.detail)}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={AppRoute.exam.packages.admin.edit.url.replace("$id", pkg.id)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t(($) => $.exam.packages.table.actions.edit)}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => onDelete(pkg)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t(($) => $.labels.delete)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col p-5 flex-grow">
        <Link
          to={AppRoute.exam.packages.admin.detail.url.replace("$id", pkg.id)}
          className="group/title block mb-4 flex-grow"
        >
          <div className="flex flex-col gap-1.5 mb-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {pkg.categoryName || (
                <span className="italic opacity-60 lowercase">{t(($) => $.labels.noCategory)}</span>
              )}
            </span>
            <h3 className="text-sm font-bold text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
              {pkg.title}
            </h3>
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-medium flex items-center gap-1">
            {pkg.educationGradeName ? (
              `${t(($) => $.labels.level)}: ${pkg.educationGradeName}`
            ) : (
              <span className="italic opacity-60 lowercase">{t(($) => $.labels.noLevel)}</span>
            )}
          </div>
        </Link>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-5 pt-4 border-t border-border/40">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.exam.packages.table.columns.sections)}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <Layers className="h-3.5 w-3.5 text-primary/60 shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {pkg.activeSections}
                </span>
                <span className="text-[10px] text-muted-foreground">/</span>
                <span className="text-xs font-semibold text-slate-500">
                  {pkg.totalSections - pkg.activeSections}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.exam.packages.table.columns.questions)}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <HelpCircle className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {pkg.activeQuestions}
                </span>
                <span className="text-[10px] text-muted-foreground">/</span>
                <span className="text-xs font-semibold text-slate-500">
                  {pkg.totalQuestions - pkg.activeQuestions}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.exam.packages.table.columns.duration)}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="h-3.5 w-3.5 text-blue-500/60 shrink-0" />
              <span className="text-xs font-semibold">{pkg.durationMinutes}m</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.labels.updatedAt)}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500/60 shrink-0" />
              <span className="text-[10px] font-medium leading-none">
                {string_to_locale_date("id-ID", pkg.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
