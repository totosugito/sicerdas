import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Layers, Target, CheckCircle2 } from "lucide-react";
import { ExamQuestion } from "@/api/exam-questions";
import { BlockNoteStatic } from "@/components/custom/components";
import { cn } from "@/lib/utils";

interface DetailContentProps {
  question: ExamQuestion;
}

export function DetailContent({ question }: DetailContentProps) {
  const { t } = useAppTranslation();

  const getOptionLabel = (idx: number) => {
    return String.fromCharCode(65 + idx); // A, B, C...
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {t(($) => $.exam.questions.detail.content.title)}
        </CardTitle>
        {question.passageTitle && (
          <CardDescription className="flex items-center gap-2 mt-1">
            <Layers className="h-4 w-4" />
            {question.passageTitle}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="prose dark:prose-invert max-w-none">
          <BlockNoteStatic content={question.content} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t(($) => $.exam.questions.detail.options.title)}
          </h3>
          <div className="grid gap-4">
            {question.options?.map((option, idx) => (
              <div
                key={option.id}
                className={cn(
                  "relative flex items-start gap-4 p-4 rounded-xl border transition-all",
                  option.isCorrect
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30 shadow-sm"
                    : "bg-background border-border hover:bg-accent/50",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold shrink-0 transition-colors",
                    option.isCorrect
                      ? "bg-green-500 dark:bg-green-500 text-white"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {getOptionLabel(idx)}
                </div>
                <div className="flex-1 pt-1">
                  <BlockNoteStatic
                    content={option.content}
                    className="border-none bg-transparent px-0"
                  />
                </div>
              </div>
            ))}
            {(!question.options || question.options.length === 0) && (
              <div className="text-center py-10 text-muted-foreground italic">
                {t(($) => $.exam.questions.edit.notFound.message)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
