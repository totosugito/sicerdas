import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BlockNoteStatic } from "@/components/custom/blocknote/BlockNoteStatic";
import { LectureTextItem } from "@/api/course/lecture-texts";
import { useAppTranslation } from "@/lib/i18n-typed";

interface DialogLectureTextPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: LectureTextItem | null;
}

export function DialogLectureTextPreview({
  open,
  onOpenChange,
  article,
}: DialogLectureTextPreviewProps) {
  const { t } = useAppTranslation();

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[85vh] p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {article.title || t(($) => $.course.lectureTexts.unnamedArticle)}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t(($) => $.course.lectureTexts.previewDesc)}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden rounded-xl border bg-card p-4">
          <BlockNoteStatic
            content={article.content}
            editable={false}
            className="border-0 bg-transparent p-0 max-w-full overflow-hidden text-sm"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
