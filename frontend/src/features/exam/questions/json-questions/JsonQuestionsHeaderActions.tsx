import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Upload, ClipboardPaste, Trash2, Sparkles } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

interface JsonQuestionsHeaderActionsProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImportClick: () => void;
  onOpenPasteModal: () => void;
  onClearQuestions: () => void;
  hasQuestions: boolean;
  isExporting: boolean;
  onNavigatePromptGenerator: () => void;
}

export function JsonQuestionsHeaderActions({
  fileInputRef,
  onFileChange,
  onImportClick,
  onOpenPasteModal,
  onClearQuestions,
  hasQuestions,
  isExporting,
  onNavigatePromptGenerator,
}: JsonQuestionsHeaderActionsProps) {
  const { t } = useAppTranslation();

  return (
    <div className="flex gap-2">
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            {t(($) => $.labels.actions)}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem className="gap-2" onClick={onNavigatePromptGenerator}>
            <Sparkles className="h-4 w-4 text-primary" />
            {t(($) => $.exam.questions.jsonQuestions.promptGeneratorButton)}
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={onImportClick}>
            <Upload className="h-4 w-4" />
            {t(($) => $.exam.questions.jsonQuestions.importButton)}
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={onOpenPasteModal}>
            <ClipboardPaste className="h-4 w-4" />
            {t(($) => $.exam.questions.jsonQuestions.pasteButton)}
          </DropdownMenuItem>
          {hasQuestions && (
            <DropdownMenuItem
              variant="destructive"
              className="gap-2"
              onClick={onClearQuestions}
              disabled={isExporting}
            >
              <Trash2 className="h-4 w-4" />
              {t(($) => $.exam.questions.jsonQuestions.clearButton)}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
