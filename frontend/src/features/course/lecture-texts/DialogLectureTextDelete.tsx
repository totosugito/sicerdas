import React from "react";
import { DialogModal } from "@/components/dialog";
import { LectureTextItem } from "@/api/course/lecture-texts";
import { Trash2 } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

interface DialogLectureTextDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: LectureTextItem | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DialogLectureTextDelete({
  open,
  onOpenChange,
  article,
  onConfirm,
  isLoading,
}: DialogLectureTextDeleteProps) {
  const { t } = useAppTranslation();

  return (
    <DialogModal
      variantSubmit="destructive"
      open={open}
      onOpenChange={onOpenChange}
      modal={{
        title: t(($) => $.course.lectureTexts.deleteConfirmTitle),
        desc: (
          <span>
            {t(($) => $.course.lectureTexts.deleteConfirmDesc)}{" "}
            <strong className="font-bold text-foreground underline decoration-destructive/40 underline-offset-2">
              {article?.title || t(($) => $.course.lectureTexts.unnamedArticle)}
            </strong>
            ?
          </span>
        ),
        variant: "destructive",
        iconType: "delete",
        headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
        showInfoSection: true,
        infoTitle: t(($) => $.course.lectureTexts.deleteInfoTitle),
        infoItems: [
          { text: t(($) => $.course.lectureTexts.deleteConsequence1) },
          { text: t(($) => $.course.lectureTexts.deleteConsequence2) },
        ],
        textCancel: t(($) => $.labels.cancel),
        textConfirm: t(($) => $.labels.delete),
        onConfirmClick: onConfirm,
        onCancelClick: () => onOpenChange(false),
      }}
    />
  );
}
