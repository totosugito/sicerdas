import React from "react";
import { Sparkles } from "lucide-react";
import { EvaluationData } from "@/api/exam-sessions";
import { HtmlViewer } from "@/components/custom/components/block-note";
import { useAppTranslation } from "@/lib/i18n-typed";

interface CbtSolutionViewProps {
  evaluation: EvaluationData;
  showSolution: boolean;
  textSizeClass?: string;
}

export const CbtSolutionView: React.FC<CbtSolutionViewProps> = ({
  evaluation,
  showSolution,
  textSizeClass,
}) => {
  const { t } = useAppTranslation();
  if (!showSolution) return null;

  return (
    <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 md:p-8 border border-primary/10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-primary" />
          {t($ => $.exam.sessions.cbt.question.solution)}
        </h3>

        {evaluation.solutions.length > 0 ? (
          <div className="space-y-10">
            {evaluation.solutions.map((sol) => (
              <div key={sol.id} className="space-y-5 relative">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground uppercase tracking-widest shadow-sm shadow-primary/20">
                    {sol.solutionType.replace("_", " ")}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">
                    {sol.title}
                  </span>
                </div>
                <div className="pl-2 border-l-2 border-primary/20">
                  <HtmlViewer
                    html={sol.htmlContent}
                    className={`prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed ${textSizeClass}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground italic text-center py-4">
            {t($ => $.exam.sessions.cbt.question.noSolution)}
          </div>
        )}
      </div>
    </div>
  );
};
