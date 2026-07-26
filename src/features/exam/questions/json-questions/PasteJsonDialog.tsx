import React, { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PasteJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (json: string) => void;
}

export function PasteJsonDialog({ open, onOpenChange, onSubmit }: PasteJsonDialogProps) {
  const { t } = useAppTranslation();
  const [pastedJson, setPastedJson] = useState("");

  const handleSubmit = () => {
    if (!pastedJson.trim()) return;
    onSubmit(pastedJson);
    setPastedJson(""); // Clear on success
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t(($) => $.exam.questions.jsonQuestions.pasteModalTitle)}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            className="min-h-[300px] font-mono text-sm"
            placeholder={t(($) => $.exam.questions.jsonQuestions.pasteModalPlaceholder)}
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t(($) => $.exam.questions.jsonQuestions.cancel)}
          </Button>
          <Button onClick={handleSubmit} disabled={!pastedJson.trim()}>
            {t(($) => $.exam.questions.jsonQuestions.submit)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
