import React, { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BlockNoteStatic } from "@/components/custom/components/BlockNoteStatic";
import { JsonQuestionContentTab } from "./JsonQuestionContentTab";
import { JsonQuestionOptionsTab } from "./JsonQuestionOptionsTab";
import { JsonQuestionSolutionsTab } from "./JsonQuestionSolutionsTab";

interface JsonQuestionEditViewProps {
  question: any;
  onUpdate: (updatedQuestion: any) => void;
  contentExpanded?: boolean;
  onToggleContent?: (expanded: boolean) => void;
  optionsExpanded?: boolean;
  onToggleOptions?: (expanded: boolean) => void;
  solutionsExpanded?: boolean;
  onToggleSolutions?: (expanded: boolean) => void;
}

export function JsonQuestionEditView({
  question,
  onUpdate,
  contentExpanded = true,
  onToggleContent,
  optionsExpanded = true,
  onToggleOptions,
  solutionsExpanded = true,
  onToggleSolutions,
}: JsonQuestionEditViewProps) {
  const { t } = useAppTranslation();

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
      {/* Content Section */}
      <JsonQuestionContentTab
        content={question.content}
        onUpdate={handleUpdateContent}
        isOpen={contentExpanded}
        onOpenChange={onToggleContent}
      />

      {/* Options Section */}
      <JsonQuestionOptionsTab
        options={question.options}
        onUpdate={handleUpdateOptions}
        isOpen={optionsExpanded}
        onOpenChange={onToggleOptions}
      />

      {/* Solutions Section */}
      <JsonQuestionSolutionsTab
        solutions={question.solutions}
        onUpdate={handleUpdateSolutions}
        isOpen={solutionsExpanded}
        onOpenChange={onToggleSolutions}
      />
    </div>
  );
}
