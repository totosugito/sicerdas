import { useAppTranslation } from "@/lib/i18n-typed";
import { JsonQuestionContentTab } from "./JsonQuestionContentTab";
import { JsonQuestionOptionsTab } from "./JsonQuestionOptionsTab";
import { JsonQuestionSolutionsTab } from "./JsonQuestionSolutionsTab";
import { JsonTagsContentTab } from "./JsonTagsContentTab";
import { JsonQuestionImport } from "@/api/exam-questions/types";

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

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
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
