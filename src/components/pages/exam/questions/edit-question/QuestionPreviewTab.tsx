import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ExamQuestion } from "@/api/exam-questions";
import { DetailContent } from "../detail-question/DetailContent";
import { DetailSolutions } from "../detail-question/DetailSolutions";
import { injectVariablesIntoBlocks, evaluateFormulas } from "@/lib/exam-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface QuestionPreviewTabProps {
  question: ExamQuestion;
}

export function QuestionPreviewTab({ question }: QuestionPreviewTabProps) {
  const { t } = useAppTranslation();

  const variations = question.variableFormulas?.variables || [];
  const [selectedIndex, setSelectedIndex] = useState<number>(variations.length > 0 ? 0 : -1);

  const processedQuestion = useMemo(() => {
    if (selectedIndex === -1 || variations.length === 0) return question;

    const variation = variations[selectedIndex];
    const formulas = question.variableFormulas?.solutions || {};

    // 1. Evaluate any math formulas for solutions
    const evaluatedSolutionsDict = evaluateFormulas(formulas, variation);

    // 2. Combine variables with evaluated formula results for a single replacement scope
    const fullScope = { ...variation, ...evaluatedSolutionsDict };

    // 3. Inject variables into all content areas
    return {
      ...question,
      content: injectVariablesIntoBlocks(question.content, fullScope),
      reasonContent:
        question.reasonContent && question.reasonContent.length > 0
          ? injectVariablesIntoBlocks(question.reasonContent, fullScope)
          : undefined,
      options: question.options?.map((opt) => ({
        ...opt,
        content: injectVariablesIntoBlocks(opt.content, fullScope),
      })),
      solutions: question.solutions?.map((sol) => ({
        ...sol,
        content: injectVariablesIntoBlocks(sol.content, fullScope),
      })),
      passage: question.passage
        ? {
            ...question.passage,
            content: injectVariablesIntoBlocks(question.passage.content, fullScope),
          }
        : null,
    };
  }, [question, selectedIndex, variations]);

  return (
    <Card className="border-t-0 rounded-t-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">
              {t(($) => $.exam.questions.edit.preview.title)}
            </CardTitle>
            <CardDescription>{t(($) => $.exam.questions.edit.preview.description)}</CardDescription>
          </div>
          {variations.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                {t(($) => $.exam.questions.edit.preview.variationSelection)}
              </span>
              <div className="flex gap-1 overflow-x-auto pb-2 max-w-[300px] sm:max-w-none">
                {variations.map((_, idx) => (
                  <Button
                    key={idx}
                    variant={selectedIndex === idx ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedIndex(idx)}
                    className="min-w-10 h-10 p-0"
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {variations.length === 0 && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-200 dark:border-blue-800/30">
            <Info className="h-5 w-5 shrink-0" />
            <p className="text-sm">{t(($) => $.exam.questions.edit.preview.noVariables)}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {t(($) => $.exam.questions.edit.preview.studentViewBadge)}
              </Badge>
              {selectedIndex !== -1 && (
                <Badge>
                  {t(($) => $.exam.questions.edit.preview.variationBadge, {
                    index: selectedIndex + 1,
                  })}
                </Badge>
              )}
            </div>
          </div>

          <DetailContent question={processedQuestion as any} />

          <div className="pt-8 border-t border-dashed">
            <DetailSolutions question={processedQuestion as any} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
