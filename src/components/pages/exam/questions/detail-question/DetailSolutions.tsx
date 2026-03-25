import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import { ExamQuestion } from "@/api/exam-questions";
import { BlockNoteStatic } from "@/components/custom/components";

interface DetailSolutionsProps {
  question: ExamQuestion;
}

export function DetailSolutions({ question }: DetailSolutionsProps) {
  const { t } = useAppTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {t(($) => $.exam.questions.detail.solutions.title)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {question.solutions && question.solutions.length > 0 ? (
          <div className="grid gap-6">
            {question.solutions.map((solution, idx) => (
              <div key={solution.id} className="space-y-3 p-4 rounded-xl border bg-muted/30">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="w-6 h-6 rounded-full p-0 flex items-center justify-center border-primary/20 bg-primary/5 text-primary"
                    >
                      {idx + 1}
                    </Badge>
                    {solution.title}
                  </h4>
                  {solution.requiredTier && (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {solution.requiredTier}
                    </Badge>
                  )}
                </div>
                <BlockNoteStatic
                  content={solution.content}
                  className="border-none bg-transparent px-0"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground italic">
            {t(($) => $.exam.questions.detail.solutions.empty)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
