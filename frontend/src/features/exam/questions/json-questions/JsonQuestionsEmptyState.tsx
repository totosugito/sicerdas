import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/general";
import { Upload, ClipboardPaste } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

interface JsonQuestionsEmptyStateProps {
  onImportClick: () => void;
  onOpenPasteModal: () => void;
}

export function JsonQuestionsEmptyState({
  onImportClick,
  onOpenPasteModal,
}: JsonQuestionsEmptyStateProps) {
  const { t } = useAppTranslation();

  return (
    <EmptyState
      icon={Upload}
      title={t(($) => $.exam.questions.jsonQuestions.noJsonImported)}
      description={t(($) => $.exam.questions.jsonQuestions.noJsonImportedDesc)}
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onImportClick} className="gap-2">
          <Upload className="h-4 w-4" />
          {t(($) => $.exam.questions.jsonQuestions.importButton)}
        </Button>
        <Button variant="outline" onClick={onOpenPasteModal} className="gap-2">
          <ClipboardPaste className="h-4 w-4" />
          {t(($) => $.exam.questions.jsonQuestions.pasteButton)}
        </Button>
      </div>
    </EmptyState>
  );
}
