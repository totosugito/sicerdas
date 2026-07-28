import { DialogModalForm, ModalFormProps } from "@/components/dialog";
import { ControlForm } from "@/components/forms";
import * as z from "zod";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  useCreateChapter,
  useUpdateChapter,
  ChapterItem,
} from "@/api/course/chapters";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export type DialogChapterFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter?: ChapterItem | null;
  courseId: string;
  onSuccess?: () => void;
};

const FormEntity = ({ values, form }: any) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <form.AppField name="chapterName">
        {(field: any) => <ControlForm field={field} item={values.chapterName} showMessage={false} />}
      </form.AppField>
      <form.AppField name="isActive">
        {(field: any) => <ControlForm field={field} item={values.isActive} showMessage={false} />}
      </form.AppField>
    </div>
  );
};

export const DialogChapterForm = ({
  open,
  onOpenChange,
  chapter,
  courseId,
  onSuccess,
}: DialogChapterFormProps) => {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const createMutation = useCreateChapter();
  const updateMutation = useUpdateChapter();

  const formSchema: any = {
    chapterName: z.string().min(1, t(($) => $.course.chapters.form.chapterName.required)),
    isActive: z.boolean().default(true),
  };

  const formConfig: any = {
    chapterName: {
      type: "text",
      name: "chapterName",
      label: t(($) => $.course.chapters.form.chapterName.label),
      placeholder: t(($) => $.course.chapters.form.chapterName.placeholder),
      required: true,
    },
    isActive: {
      type: "switch",
      name: "isActive",
      label: t(($) => $.course.chapters.form.isActive.label),
      description: t(($) => $.course.chapters.form.isActive.description),
    },
  };

  const modalProps: ModalFormProps = {
    title: chapter
      ? t(($) => $.course.chapters.form.editTitle)
      : t(($) => $.course.chapters.form.addTitle),
    desc: chapter
      ? t(($) => $.course.chapters.form.editDesc)
      : t(($) => $.course.chapters.form.createDesc),
    modal: true,
    textConfirm:
      createMutation.isPending || updateMutation.isPending
        ? t(($) => $.labels.saving)
        : t(($) => $.labels.save),
    textCancel: t(($) => $.labels.cancel),
    defaultValue: {
      chapterName: chapter?.chapterName || "",
      isActive: chapter?.isActive ?? true,
    },
    child: formConfig,
    schema: formSchema,
    content: <FormEntity />,
    onCancelClick: () => onOpenChange(false),
    onConfirmClick: async (values) => {
      if (chapter) {
        // EDIT MODE
        await updateMutation.mutateAsync(
          {
            id: chapter.id,
            chapterName: values.chapterName,
            isActive: values.isActive,
          },
          {
            onSuccess: (res) => {
              showNotifSuccess({ message: res.message || t(($) => $.course.chapters.form.updateSuccess) });
              queryClient.invalidateQueries({ queryKey: ["admin-course-chapters-list", courseId] });
              onSuccess?.();
              onOpenChange(false);
            },
            onError: (err: any) => {
              showNotifError({ message: err.message || t(($) => $.labels.error) });
            },
          },
        );
      } else {
        // CREATE MODE
        await createMutation.mutateAsync(
          {
            courseId,
            chapterName: values.chapterName,
            isActive: values.isActive,
          },
          {
            onSuccess: (res) => {
              showNotifSuccess({ message: res.message || t(($) => $.course.chapters.form.createSuccess) });
              queryClient.invalidateQueries({ queryKey: ["admin-course-chapters-list", courseId] });
              queryClient.invalidateQueries({ queryKey: ["admin-course-courses-detail", courseId] });
              onSuccess?.();
              onOpenChange(false);
            },
            onError: (err: any) => {
              showNotifError({ message: err.message || t(($) => $.labels.error) });
            },
          },
        );
      }
    },
  };

  if (!open) return null;

  return <DialogModalForm modal={modalProps} />;
};
