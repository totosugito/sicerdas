import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionContentForm } from "./QuestionContentForm";
import { useAppTranslation } from "@/lib/i18n-typed";

interface QuestionContentTabProps {
  defaultValues: any;
  onSubmit: (values: { content?: any[]; reasonContent?: any[] }) => void;
  isPending: boolean;
}

export function QuestionContentTab({
  defaultValues,
  onSubmit,
  isPending,
}: QuestionContentTabProps) {
  const { t } = useAppTranslation();
  return (
    <Card className="border-t-0 rounded-t-none">
      <CardHeader>
        <CardTitle className="text-xl">{t(($) => $.exam.questions.edit.content.title)}</CardTitle>
        <CardDescription>{t(($) => $.exam.questions.edit.content.description)}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <QuestionContentForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isPending={isPending}
        />
      </CardContent>
    </Card>
  );
}
