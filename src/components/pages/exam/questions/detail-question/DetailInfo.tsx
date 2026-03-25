import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, HelpCircle } from "lucide-react";
import { ExamQuestion } from "@/api/exam-questions";
import { cn } from "@/lib/utils";

interface DetailInfoProps {
  question: ExamQuestion;
}

export function DetailInfo({ question }: DetailInfoProps) {
  const { t } = useAppTranslation();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          {t(($) => $.exam.questions.detail.info.title)}
        </CardTitle>
        <CardDescription>{t(($) => $.exam.questions.detail.info.description)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t(($) => $.exam.questions.table.columns.subject)}
            </p>
            <p className="font-medium text-lg">{question.subjectName || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t(($) => $.exam.questions.table.columns.difficulty)}
            </p>
            <div>
              <Badge className={cn("px-3 py-1", getDifficultyColor(question.difficulty))}>
                {t(
                  ($) =>
                    $.exam.questions.form.difficulty.options[
                      question.difficulty as "easy" | "medium" | "hard"
                    ],
                )}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t(($) => $.exam.questions.table.columns.type)}
            </p>
            <p className="font-medium text-lg">
              {t(
                ($) =>
                  $.exam.questions.form.type.options[question.type as "multiple_choice" | "essay"],
              )}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t(($) => $.exam.questions.table.columns.educationGrade)}
            </p>
            <p className="font-medium text-lg">{question.educationGradeName || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t(($) => $.exam.questions.table.columns.requiredTier)}
            </p>
            <p className="font-medium text-lg uppercase">{question.requiredTier || "Free"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t(($) => $.exam.questions.table.columns.status)}
            </p>
            <div>
              <Badge variant={question.isActive ? "default" : "secondary"}>
                {question.isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {t(($) => $.exam.questions.edit.tabs.tags)}
          </h3>
          <div className="flex flex-wrap gap-2 text-md">
            {question.tags && question.tags.length > 0 ? (
              question.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="px-3 py-1 text-md">
                  {tag.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic">-</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
