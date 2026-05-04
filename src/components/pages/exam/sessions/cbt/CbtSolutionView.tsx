import React, { useState, useEffect } from "react";
import { Sparkles, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvaluationData } from "@/api/exam-sessions";
import { HtmlViewer } from "@/components/custom/components/block-note";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface CbtSolutionViewProps {
  evaluation: EvaluationData;
  showSolution: boolean;
  onHide?: () => void;
  textSizeClass?: string;
}

export const CbtSolutionView: React.FC<CbtSolutionViewProps> = ({
  evaluation,
  showSolution,
  onHide,
  textSizeClass,
}) => {
  const { t } = useAppTranslation();
  const [activeSolutionId, setActiveSolutionId] = useState<string | null>(null);

  useEffect(() => {
    if (evaluation?.solutions?.length > 0 && !activeSolutionId) {
      setActiveSolutionId(evaluation.solutions[0].id);
    }
  }, [evaluation?.solutions, activeSolutionId]);

  if (!showSolution || !evaluation) return null;

  const activeSolution = evaluation.solutions?.find((s) => s.id === activeSolutionId);

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-center gap-4 my-10">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-700" />
        <Sparkles className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-700" />
      </div>

      <div className="relative overflow-hidden rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-3 pr-4 flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary" />

          <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="relative">
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase leading-none">
              {t($ => $.exam.sessions.cbt.question.solution)}
            </h3>
          </div>
        </div>

        {onHide && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onHide}
            className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors gap-2"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
              {t($ => $.exam.sessions.cbt.question.hideSolution)}
            </span>
          </Button>
        )}
      </div>

      {evaluation.solutions?.length > 0 ? (
        <div className="space-y-6 mt-4">
          {evaluation.solutions.length > 1 && (
            <div className="flex flex-wrap gap-2 py-4 border-b border-slate-100 dark:border-slate-800/50 mb-6">
              {evaluation.solutions.map((sol) => (
                <button
                  key={sol.id}
                  onClick={() => setActiveSolutionId(sol.id)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest transition-all duration-200 border",
                    activeSolutionId === sol.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 text-muted-foreground border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {t($ => ($.exam.solutions.form.type.options as any)[sol.solutionType])}
                </button>
              ))}
            </div>
          )}

          {activeSolution ? (
            <div key={activeSolution.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
              <HtmlViewer
                html={activeSolution.htmlContent}
                className={textSizeClass}
              />
            </div>
          ) : (
            <div className="text-muted-foreground italic text-sm">
              {t($ => $.exam.sessions.cbt.question.selectSolution)}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-muted-foreground animate-in fade-in zoom-in duration-500 my-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Sparkles className="w-6 h-6 opacity-20" />
          </div>
          <p className="text-sm font-medium italic">
            {t($ => $.exam.sessions.cbt.question.noSolution)}
          </p>
        </div>
      )}
    </div>
  );
};
