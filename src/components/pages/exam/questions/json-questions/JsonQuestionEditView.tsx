import { useAppTranslation } from "@/lib/i18n-typed";
import { JsonQuestionContentTab } from "./JsonQuestionContentTab";
import { JsonQuestionOptionsTab } from "./JsonQuestionOptionsTab";
import { JsonQuestionSolutionsTab } from "./JsonQuestionSolutionsTab";
import { JsonTagsContentTab } from "./JsonTagsContentTab";
import { JsonQuestionVariablesTab } from "./JsonQuestionVariablesTab";
import { JsonQuestionReasonTab } from "./JsonQuestionReasonTab";
import { JsonQuestionPreviewTab } from "./JsonQuestionPreviewTab";
import { JsonQuestionImport, VariableFormulas, EnumQuestionType } from "@/api/exam-questions/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, PencilLine, Settings2 } from "lucide-react";

interface JsonQuestionEditViewProps {
  question: JsonQuestionImport;
  availableTags?: string[];
  onUpdate: (updatedQuestion: JsonQuestionImport) => void;
  tab?: string;
  onTabChange?: (tab: string) => void;
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
  reasonExpanded?: boolean;
  onToggleReason?: (expanded: boolean) => void;
  previewExpanded?: boolean;
  onTogglePreview?: (expanded: boolean) => void;
}

export function JsonQuestionEditView({
  question,
  availableTags = [],
  onUpdate,
  tab = "edit",
  onTabChange,
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
  reasonExpanded = true,
  onToggleReason,
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

  const handleUpdateReasonContent = (newReasonContent: any[]) => {
    onUpdate({ ...question, reasonContent: newReasonContent });
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <Tabs value={tab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[450px] mb-4">
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            {t(($) => $.exam.questions.edit.tabs.preview)}
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <PencilLine className="h-4 w-4" />
            {t(($) => $.exam.questions.edit.tabs.content)}
          </TabsTrigger>
          <TabsTrigger value="variables" className="gap-2">
            <Settings2 className="h-4 w-4" />
            {t(($) => $.exam.questions.edit.tabs.variables)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex flex-col gap-6 mt-0">
          {/* Preview Section */}
          <JsonQuestionPreviewTab
            question={question}
            isOpen={previewExpanded}
            onOpenChange={onTogglePreview}
          />

          {/* Tags Section */}
          <JsonTagsContentTab
            tags={question.tags}
            availableTags={availableTags}
            onUpdate={handleUpdateTags}
            isOpen={tagsExpanded}
            onOpenChange={onToggleTags}
          />
        </TabsContent>

        <TabsContent value="edit" className="flex flex-col gap-6 mt-0">
          {/* Content Section */}
          <JsonQuestionContentTab
            content={question.content}
            onUpdate={handleUpdateContent}
            isOpen={contentExpanded}
            onOpenChange={onToggleContent}
          />

          {/* Reason Section (Conditional) */}
          {(question.reasonContent || question.type === EnumQuestionType.STATEMENT_REASONING) && (
            <JsonQuestionReasonTab
              reasonContent={question.reasonContent}
              onUpdate={handleUpdateReasonContent}
              isOpen={reasonExpanded}
              onOpenChange={onToggleReason}
            />
          )}

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
        </TabsContent>

        <TabsContent value="variables" className="flex flex-col gap-6 mt-0">
          {/* Variables Section */}
          <JsonQuestionVariablesTab
            variableFormulas={question.variableFormulas}
            onUpdate={handleUpdateVariables}
            isOpen={variablesExpanded}
            onOpenChange={onToggleVariables}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
