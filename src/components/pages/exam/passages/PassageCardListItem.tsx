import React from "react";
import { ExamPassage } from "@/api/exam-passages";
import { useAppTranslation } from "@/lib/i18n-typed";
import { MoreHorizontal, Pencil, Trash2, BookOpen, Clock, HelpCircle, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { string_to_locale_date } from "@/lib/my-utils";
import { blocknote_to_text } from "@/lib/blocknote-utils";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";

interface PassageCardListItemProps {
  passage: ExamPassage;
  onDelete: (passage: ExamPassage) => void;
}

export function PassageCardListItem({ passage, onDelete }: PassageCardListItemProps) {
  const { t } = useAppTranslation();
  const plainText = blocknote_to_text(passage.content);

  return (
    <div className="group relative flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden h-full">
      {/* Visual Header */}
      <div className="h-24 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
          <BookOpen className="h-24 w-24 text-primary" />
        </div>

        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern
              id={`pattern-passage-${passage.id}`}
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#pattern-passage-${passage.id})`} />
          </svg>
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          <Badge
            className={cn(
              "shadow-sm border-transparent",
              passage.isActive
                ? "bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-600/20 dark:text-emerald-400 dark:border-emerald-500/30"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
            )}
          >
            {passage.isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
          </Badge>
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
                  to={AppRoute.exam.passages.admin.edit.url.replace("$id", passage.id)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4 text-primary" />
                  {t(($) => $.labels.edit)}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => onDelete(passage)}
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
          to={AppRoute.exam.passages.admin.edit.url.replace("$id", passage.id)}
          className="group/title block mb-4 flex-grow"
        >
          <div className="flex flex-col gap-1.5 mb-2">
            <h3 className="text-sm font-bold text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
              {passage.title || "No Title"}
            </h3>
          </div>
          <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed opacity-80">
            {plainText || <span className="italic opacity-60">{t(($) => $.labels.noContent)}</span>}
          </div>
        </Link>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 pt-4 border-t border-border/40">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.exam.passages.table.columns.subject)}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <BookOpen className="h-3.5 w-3.5 text-primary/60 shrink-0" />
              <span className="text-xs font-semibold truncate">
                {passage.subjectName || (
                  <span className="italic opacity-60 normal-case font-normal">
                    {t(($) => $.labels.noSubject)}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.exam.passages.table.columns.questions)}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <HelpCircle className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
              <span className="text-xs font-semibold">{passage.totalQuestions || 0}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-medium leading-none">
              {string_to_locale_date("id-ID", passage.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
