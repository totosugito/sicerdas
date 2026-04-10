import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Info } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { JsonQuestionImport } from "@/api/exam-questions/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DetailContent } from "../detail-question/DetailContent";
import { DetailSolutions } from "../detail-question/DetailSolutions";
import { injectVariablesIntoBlocks, evaluateFormulas } from "@/lib/exam-utils";

interface JsonQuestionPreviewTabProps {
  question: JsonQuestionImport;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JsonQuestionPreviewTab({
  question,
  isOpen = true,
  onOpenChange,
}: JsonQuestionPreviewTabProps) {
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
      content: injectVariablesIntoBlocks(question.content as any, fullScope),
      options: question.options?.map((opt) => ({
        ...opt,
        content: injectVariablesIntoBlocks(opt.content as any, fullScope),
      })),
      solutions: question.solutions?.map((sol) => ({
        ...sol,
        content: injectVariablesIntoBlocks(sol.content as any, fullScope),
      })),
    };
  }, [question, selectedIndex, variations]);

  return (
    <Card className="shadow-sm overflow-hidden border-border/50 p-6">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-4 bg-muted/5">
          <CollapsibleTrigger asChild>
            <div className="flex flex-col gap-1 cursor-pointer group flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  {t(($) => $.exam.questions.edit.preview.title)}
                </CardTitle>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform text-muted-foreground group-hover:text-primary",
                    isOpen && "rotate-180",
                  )}
                />
              </div>
              <CardDescription>
                {t(($) => $.exam.questions.edit.preview.description)}
              </CardDescription>
            </div>
          </CollapsibleTrigger>

          {variations.length > 0 && isOpen && (
            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none ml-4">
              {variations.map((_, idx) => (
                <Button
                  key={idx}
                  variant={selectedIndex === idx ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(idx);
                  }}
                  className="min-w-8 h-8 p-0"
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="bg-card p-0 pt-4 space-y-6">
            {variations.length === 0 && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-200 dark:border-blue-800/30">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-sm">{t(($) => $.exam.questions.edit.preview.noVariables)}</p>
              </div>
            )}

            <div className="space-y-6">
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

              <DetailContent question={processedQuestion as any} />

              <div className="pt-8 border-t border-dashed">
                <DetailSolutions question={processedQuestion as any} />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
