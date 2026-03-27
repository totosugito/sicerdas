import React, { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BlockNoteStatic } from "@/components/custom/components/BlockNoteStatic";
import { JsonQuestionOptionsTab } from "./JsonQuestionOptionsTab";
import { JsonQuestionSolutionsTab } from "./JsonQuestionSolutionsTab";
import { DialogLocalContentForm } from "./DialogLocalContentForm";

interface JsonQuestionEditViewProps {
  question: any;
  onUpdate: (updatedQuestion: any) => void;
}

export function JsonQuestionEditView({ question, onUpdate }: JsonQuestionEditViewProps) {
  const { t } = useAppTranslation();
  const [showContentDialog, setShowContentDialog] = useState(false);

  const handleUpdateOptions = (newOptions: any[]) => {
    onUpdate({ ...question, options: newOptions });
  };

  const handleUpdateSolutions = (newSolutions: any[]) => {
    onUpdate({ ...question, solutions: newSolutions });
  };

  const handleUpdateContent = (newContent: any[]) => {
    onUpdate({ ...question, content: newContent });
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Question Content Section */}
      <Card className="shadow-sm overflow-hidden border-border/50 py-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-0 bg-muted/5">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">
              {t(($) => $.exam.questions.edit.content.title)}
            </CardTitle>
            <CardDescription>{t(($) => $.exam.questions.edit.content.description)}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all h-9 px-4"
            onClick={() => setShowContentDialog(true)}
          >
            <Pencil className="h-4 w-4" />
            {t(($) => $.labels.edit)}
          </Button>
        </CardHeader>
        <CardContent className="bg-card pb-2">
          <div className="rounded-xl border bg-background/50 backdrop-blur-sm p-1">
            <BlockNoteStatic
              content={question.content}
              className="border-0 shadow-none"
              minHeight="150px"
            />
          </div>
        </CardContent>
      </Card>

      {/* Options Section */}
      <JsonQuestionOptionsTab options={question.options} onUpdate={handleUpdateOptions} />

      {/* Solutions Section */}
      <JsonQuestionSolutionsTab solutions={question.solutions} onUpdate={handleUpdateSolutions} />

      <DialogLocalContentForm
        open={showContentDialog}
        onOpenChange={setShowContentDialog}
        content={question.content}
        onConfirm={handleUpdateContent}
      />
    </div>
  );
}
