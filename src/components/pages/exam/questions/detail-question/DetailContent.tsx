import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Layers, Target } from "lucide-react";
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
      <CardContent className="space-y-6">
        {question.passage && (
          <div className="flex flex-col gap-4 border-b pb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {t(($) => $.exam.questions.form.passage.label)} : {question.passage.title || "-"}
            </h3>
            <BlockNoteStatic
              content={question.passage.content}
              className="border-none bg-transparent px-0"
              editable={false}
            />
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t(($) => $.exam.questions.detail.content.title)}
          </h3>
          <BlockNoteStatic content={question.content} editable={false} />

          {question.reasonContent && question.reasonContent.length > 0 && (
            <div className="mt-6 pt-6 border-t border-dashed">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                {t(($) => $.exam.questions.form.reasonContent.label)}
              </h3>
              <BlockNoteStatic content={question.reasonContent} editable={false} />
            </div>
          )}
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
                <div className="flex flex-col items-center gap-2">
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
                  {Number(option.score) > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1 h-4 bg-primary/5">
                      +{option.score}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <BlockNoteStatic
                    content={option.content}
                    className="border-none bg-transparent px-0"
                    editable={false}
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
