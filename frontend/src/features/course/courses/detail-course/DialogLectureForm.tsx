import React, { useEffect, useRef, useState } from "react";
import { DialogModalForm, ModalFormProps } from "@/components/dialog";
import { ControlForm } from "@/components/forms";
import * as z from "zod";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  useCreateLecture,
  useUpdateLecture,
  LectureItem,
} from "@/api/course/lectures";
import { useDetailLectureText } from "@/api/course/lecture-texts";
import { useListPackageSectionSimple } from "@/api/exam/package-sections/admin/list-section-simple";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { EnumLectureType } from "@/api/course/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogAssetPicker } from "./DialogAssetPicker";

export type DialogLectureFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lecture?: LectureItem | null;
  chapterId: string;
  courseId: string;
  onSuccess?: () => void;
};

const FormConditionalFields = ({
  currentType,
  selectedPackageId,
  referenceUrl,
  form,
}: any) => {
  const { t } = useAppTranslation();
  const [showPicker, setShowPicker] = useState(false);

  // Fetch detail of selected article to display its title
  const { data: textDetail } = useDetailLectureText(
    currentType === EnumLectureType.TEXT && referenceUrl && referenceUrl.length === 36
      ? referenceUrl
      : ""
  );

  // Fetch sections to resolve selected subtest label
  const { data: sectionData } = useListPackageSectionSimple({
    packageId: currentType === EnumLectureType.EXAM && selectedPackageId ? selectedPackageId : undefined,
  });

  const selectedTextLabel = textDetail?.data?.title || referenceUrl || t(($) => $.course.lectures.picker.selectArticlePlaceholder);
  const selectedSectionLabel =
    (sectionData?.data?.items || []).find((s: any) => s.value === referenceUrl)?.label ||
    referenceUrl ||
    t(($) => $.course.lectures.picker.selectExamPlaceholder);

  const lastType = useRef(currentType);

  useEffect(() => {
    if (currentType !== lastType.current) {
      form.setFieldValue("referenceUrl", "");
      form.setFieldValue("packageId", "");
      lastType.current = currentType;
    }
  }, [currentType, form]);

  if (currentType === EnumLectureType.TEXT) {
    return (
      <div className="flex flex-col gap-2 mt-1">
        <label className="text-xs font-semibold text-muted-foreground">
          {t(($: any) => $.course.lectures.form.referenceUrl.label)}
        </label>
        <div className="flex gap-2">
          <Input value={selectedTextLabel} readOnly className="bg-muted text-xs flex-1 h-9" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPicker(true)}
            className="shrink-0 h-9 text-xs"
          >
            {t(($) => $.course.lectures.picker.btnSearchArticle)}
          </Button>
        </div>

        <DialogAssetPicker
          open={showPicker}
          onOpenChange={setShowPicker}
          type="text"
          onSelect={(selected) => {
            form.setFieldValue("referenceUrl", selected.id);
          }}
        />
      </div>
    );
  }

  if (currentType === EnumLectureType.EXAM) {
    return (
      <div className="flex flex-col gap-3 mt-1">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">
            {t(($: any) => $.course.lectures.form.referenceUrl.label)}
          </label>
          <div className="flex gap-2">
            <Input value={selectedSectionLabel} readOnly className="bg-muted text-xs flex-1 h-9" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPicker(true)}
              className="shrink-0 h-9 text-xs"
            >
              {t(($) => $.course.lectures.picker.btnSearchExam)}
            </Button>
          </div>
        </div>

        <form.AppField name="successThreshold">
          {(field: any) => (
            <ControlForm
              field={field}
              item={{
                type: "number",
                name: "successThreshold",
                label: t(($) => $.course.lectures.form.successThreshold.label),
                placeholder: t(($) => $.course.lectures.form.successThreshold.placeholder),
                description: t(($) => $.course.lectures.form.successThreshold.description),
              }}
              showMessage={false}
            />
          )}
        </form.AppField>

        <DialogAssetPicker
          open={showPicker}
          onOpenChange={setShowPicker}
          type="exam"
          onSelect={(selected) => {
            form.setFieldValue("referenceUrl", selected.id);
            form.setFieldValue("packageId", selected.packageId || "");
          }}
        />
      </div>
    );
  }

  if (
    currentType &&
    currentType !== EnumLectureType.TEXT &&
    currentType !== EnumLectureType.EXAM
  ) {
    return (
      <form.AppField name="referenceUrl">
        {(field: any) => (
          <ControlForm
            field={field}
            item={{
              type: "text",
              name: "referenceUrl",
              label: t(($: any) => $.course.lectures.form.referenceUrl.label),
              placeholder: t(($: any) => $.course.lectures.form.referenceUrl.placeholder),
              required: true,
            }}
            showMessage={false}
          />
        )}
      </form.AppField>
    );
  }

  return null;
};

const FormEntity = ({ values, form }: any) => {
  const { t } = useAppTranslation();

  return (
    <div className="flex flex-col gap-4 w-full">
      <form.AppField name="title">
        {(field: any) => <ControlForm field={field} item={values.title} showMessage={false} />}
      </form.AppField>

      <form.AppField name="description">
        {(field: any) => <ControlForm field={field} item={values.description} showMessage={false} />}
      </form.AppField>

      <form.AppField name="type">
        {(field: any) => <ControlForm field={field} item={values.type} showMessage={false} />}
      </form.AppField>

      <form.Subscribe
        selector={(state: any) => [
          state.values.type,
          state.values.packageId,
          state.values.referenceUrl,
        ]}
      >
        {([currentType, selectedPackageId, referenceUrl]: [
          string | undefined,
          string | undefined,
          string | undefined,
        ]) => {
          return (
            <FormConditionalFields
              currentType={currentType}
              selectedPackageId={selectedPackageId}
              referenceUrl={referenceUrl}
              form={form}
            />
          );
        }}
      </form.Subscribe>

      <form.AppField name="isActive">
        {(field: any) => <ControlForm field={field} item={values.isActive} showMessage={false} />}
      </form.AppField>
    </div>
  );
};

export const DialogLectureForm = ({
  open,
  onOpenChange,
  lecture,
  chapterId,
  courseId,
  onSuccess,
}: DialogLectureFormProps) => {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const createMutation = useCreateLecture();
  const updateMutation = useUpdateLecture();

  const typeOptions = [
    { label: t(($) => $.course.lectures.form.type.text), value: EnumLectureType.TEXT },
    { label: t(($) => $.course.lectures.form.type.video), value: EnumLectureType.VIDEO },
    { label: t(($) => $.course.lectures.form.type.pdf), value: EnumLectureType.PDF },
    { label: t(($) => $.course.lectures.form.type.exam), value: EnumLectureType.EXAM },
    { label: t(($) => $.course.lectures.form.type.discussion), value: EnumLectureType.DISCUSSION },
    { label: t(($) => $.course.lectures.form.type.other), value: EnumLectureType.OTHER },
  ];

  const formSchema: any = {
    title: z.string().min(1, t(($) => $.course.lectures.form.title.required)),
    description: z.string().optional(),
    type: z.string().min(1, t(($) => $.course.lectures.form.type.required)),
    packageId: z.string().optional().nullable(),
    referenceUrl: z.string().min(1, t(($) => $.course.lectures.form.referenceUrl.required)),
    successThreshold: z.preprocess((val) => val === "" || val === undefined ? undefined : Number(val), z.number().min(0).max(100).optional()),
    isActive: z.boolean().default(true),
  };

  const formConfig: any = {
    title: {
      type: "text",
      name: "title",
      label: t(($) => $.course.lectures.form.title.label),
      placeholder: t(($) => $.course.lectures.form.title.placeholder),
      required: true,
    },
    description: {
      type: "textarea",
      name: "description",
      label: t(($) => $.course.lectures.form.description.label),
      placeholder: t(($) => $.course.lectures.form.description.placeholder),
    },
    type: {
      type: "select",
      name: "type",
      label: t(($) => $.course.lectures.form.type.label),
      options: typeOptions,
      required: true,
    },
    isActive: {
      type: "switch",
      name: "isActive",
      label: t(($) => $.course.lectures.form.isActive.label),
      description: t(($) => $.course.lectures.form.isActive.description),
    },
  };

  // Restore packageId and successThreshold from extra if editing an exam lecture
  const defaultPackageId =
    lecture?.type === EnumLectureType.EXAM && lecture?.extra
      ? (lecture.extra as any).packageId || ""
      : "";

  const defaultSuccessThreshold =
    lecture?.type === EnumLectureType.EXAM && lecture?.extra
      ? (lecture.extra as any).successThreshold ?? ""
      : "";

  const modalProps: ModalFormProps = {
    title: lecture
      ? t(($) => $.course.lectures.editTitle)
      : t(($) => $.course.lectures.createTitle),
    desc: lecture
      ? t(($) => $.course.lectures.description)
      : t(($) => $.course.lectures.description),
    modal: true,
    textConfirm:
      createMutation.isPending || updateMutation.isPending
        ? t(($) => $.labels.saving)
        : t(($) => $.labels.save),
    textCancel: t(($) => $.labels.cancel),
    defaultValue: {
      title: lecture?.title || "",
      description: lecture?.description || "",
      type: lecture?.type || "",
      packageId: defaultPackageId,
      referenceUrl: lecture?.referenceUrl || "",
      successThreshold: defaultSuccessThreshold,
      isActive: lecture?.isActive ?? true,
    },
    child: formConfig,
    schema: formSchema,
    content: <FormEntity />,
    onCancelClick: () => onOpenChange(false),
    onConfirmClick: async (values) => {
      const submitPayload: any = {
        title: values.title,
        description: values.description || null,
        type: values.type,
        referenceUrl: values.referenceUrl,
        isActive: values.isActive,
        extra:
          values.type === EnumLectureType.EXAM
            ? {
              packageId: values.packageId,
              successThreshold:
                values.successThreshold !== undefined && values.successThreshold !== ""
                  ? Number(values.successThreshold)
                  : undefined,
            }
            : null,
      };

      if (lecture) {
        // EDIT MODE
        await updateMutation.mutateAsync(
          {
            id: lecture.id,
            ...submitPayload,
          },
          {
            onSuccess: (res) => {
              showNotifSuccess({ message: res.message || t(($) => $.course.lectures.updateSuccess) });
              queryClient.invalidateQueries({ queryKey: ["admin-course-structure", courseId] });
              queryClient.invalidateQueries({ queryKey: ["admin-course-courses-detail", courseId] });
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
            chapterId,
            ...submitPayload,
          },
          {
            onSuccess: (res) => {
              showNotifSuccess({ message: res.message || t(($) => $.course.lectures.createSuccess) });
              queryClient.invalidateQueries({ queryKey: ["admin-course-structure", courseId] });
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
