import { useAppTranslation } from "@/lib/i18n-typed";
import { JsonQuestionContentTab } from "./JsonQuestionContentTab";
import { JsonQuestionOptionsTab } from "./JsonQuestionOptionsTab";
import { JsonQuestionSolutionsTab } from "./JsonQuestionSolutionsTab";
import { JsonTagsContentTab } from "./JsonTagsContentTab";
import { JsonQuestionVariablesTab } from "./JsonQuestionVariablesTab";
import { JsonQuestionPreviewTab } from "./JsonQuestionPreviewTab";
import { JsonQuestionImport, VariableFormulas } from "@/api/exam-questions/types";

interface JsonQuestionEditViewProps {
  question: JsonQuestionImport;
  availableTags?: string[];
  onUpdate: (updatedQuestion: JsonQuestionImport) => void;
  contentExpanded?: boolean;
  onToggleContent?: (expanded: boolean) => void;
  optionsExpanded?: boolean;
  onToggleOptions?: (expanded: boolean) => void;
  solutionsExpanded?: boolean;
  onToggleSolutions?: (expanded: boolean) => void;
  tagsExpanded?: boolean;
  onToggleTags?: (expanded: boolean) => void;
  variablesExpanded?: boolean;
  onToggleVariables?: (expanded: boolean) => void;
  previewExpanded?: boolean;
  onTogglePreview?: (expanded: boolean) => void;
}

export function JsonQuestionEditView({
  question,
  availableTags = [],
  onUpdate,
  contentExpanded = true,
  onToggleContent,
  optionsExpanded = true,
  onToggleOptions,
  solutionsExpanded = true,
  onToggleSolutions,
  tagsExpanded = true,
  onToggleTags,
  variablesExpanded = true,
  onToggleVariables,
  previewExpanded = true,
  onTogglePreview,
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

  const handleUpdateTags = (newTags: string[]) => {
    onUpdate({ ...question, tags: newTags });
  };

  const handleUpdateVariables = (newVariables: VariableFormulas) => {
    onUpdate({ ...question, variableFormulas: newVariables });
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Preview Section */}
      <JsonQuestionPreviewTab
        question={question}
        isOpen={previewExpanded}
        onOpenChange={onTogglePreview}
      />

      {/* Variables Section */}
      <JsonQuestionVariablesTab
        variableFormulas={question.variableFormulas}
        onUpdate={handleUpdateVariables}
        isOpen={variablesExpanded}
        onOpenChange={onToggleVariables}
      />

      {/* Tags Section */}
      <JsonTagsContentTab
        tags={question.tags}
        availableTags={availableTags}
        onUpdate={handleUpdateTags}
        isOpen={tagsExpanded}
        onOpenChange={onToggleTags}
      />

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
