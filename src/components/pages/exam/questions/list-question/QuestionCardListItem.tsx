import React from "react";
import { ExamQuestion } from "@/api/exam-questions";
import { useAppTranslation } from "@/lib/i18n-typed";
import { MoreHorizontal, Pencil, Trash2, HelpCircle, Clock, BookOpen, Target } from "lucide-react";
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

interface QuestionCardListItemProps {
  question: ExamQuestion;
  onDelete: (question: ExamQuestion) => void;
}

export function QuestionCardListItem({ question, onDelete }: QuestionCardListItemProps) {
  const { t } = useAppTranslation();
  const plainText = blocknote_to_text(question.content);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "hard":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
    }
  };

  return (
    <div className="group relative flex flex-col bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden h-full">
      {/* Visual Header */}
      <div className="h-24 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
          <HelpCircle className="h-24 w-24 text-primary" />
        </div>

        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern
              id={`pattern-${question.id}`}
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#pattern-${question.id})`} />
          </svg>
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          <Badge
            className={cn(
              "shadow-sm border-transparent",
              question.isActive
                ? "bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-600/20 dark:text-emerald-400 dark:border-emerald-500/30"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700",
            )}
          >
            {question.isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "font-bold capitalize shadow-sm",
              getDifficultyColor(question.difficulty),
            )}
          >
            {t(
              ($) =>
                $.exam.questions.form.difficulty.options[
                  question.difficulty as "easy" | "medium" | "hard"
                ],
            )}
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
                  to={AppRoute.exam.questions.admin.edit.url.replace("$id", question.id)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4 text-primary" />
                  {t(($) => $.labels.edit)}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => onDelete(question)}
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
          to={AppRoute.exam.questions.admin.detail.url.replace("$id", question.id)}
          className="group/title block mb-4 flex-grow"
        >
          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
            {plainText || <span className="italic opacity-60">{t(($) => $.labels.noContent)}</span>}
          </div>
        </Link>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.exam.questions.table.columns.subject)}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <BookOpen className="h-3.5 w-3.5 text-primary/60 shrink-0" />
              <span className="text-xs font-semibold truncate">
                {question.subjectName || (
                  <span className="italic opacity-60 normal-case font-normal">
                    {t(($) => $.labels.noSubject)}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(($) => $.exam.questions.table.columns.maxScore)}
            </span>
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
              <span className="text-xs font-bold">{question.maxScore ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <Badge
            variant="outline"
            className="text-[10px] font-bold px-2 py-0 h-5 bg-muted/30 text-muted-foreground border-border/60 uppercase tracking-tighter"
          >
            {question.type.replace("_", " ")}
          </Badge>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-medium leading-none">
              {string_to_locale_date("id-ID", question.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
