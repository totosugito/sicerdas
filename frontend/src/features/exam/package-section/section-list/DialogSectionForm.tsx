import { DialogModalForm, ModalFormProps } from "@/components/dialog";
import { ControlForm } from "@/components/forms";
import * as z from "zod";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  useCreatePackageSection,
  useUpdatePackageSection,
  ExamPackageSection,
} from "@/api/exam/package-sections";
import React from "react";
import { useListPackageSimple } from "@/api/exam/packages";
import { useListVersionSimple } from "@/api/version";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { durationOnMinutes } from "@/constants/app-enum";
import { EnumContentType } from "@/api/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DialogSectionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: ExamPackageSection | null;
  packageId?: string;
  packageIdDisabled?: boolean;
  onSuccess?: () => void;
};

const FormEntity = ({ values, form, packageIdDisabled }: any) => {
  const { t } = useAppTranslation();
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="general">{t(($) => $.exam.sections.tabGeneral)}</TabsTrigger>
        <TabsTrigger value="settings">{t(($) => $.exam.sections.tabSettings)}</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="flex flex-col gap-4 mt-2">
        {values.packageId && (
          <form.AppField name="packageId">
            {(field: any) => (
              <ControlForm
                field={field}
                item={values.packageId}
                showMessage={false}
                disabled={packageIdDisabled}
              />
            )}
          </form.AppField>
        )}
        <form.AppField name="title">
          {(field: any) => <ControlForm field={field} item={values.title} showMessage={false} />}
        </form.AppField>
        <form.AppField name="groupName">
          {(field: any) => <ControlForm field={field} item={values.groupName} showMessage={false} />}
        </form.AppField>
        <form.AppField name="description">
          {(field: any) => <ControlForm field={field} item={values.description} showMessage={false} />}
        </form.AppField>
        <form.AppField name="isActive">
          {(field: any) => <ControlForm field={field} item={values.isActive} showMessage={false} />}
        </form.AppField>
      </TabsContent>

      <TabsContent value="settings" className="flex flex-col gap-4 mt-2">
        <form.AppField name="durationMinutes">
          {(field: any) => <ControlForm field={field} item={values.durationMinutes} showMessage={false} />}
        </form.AppField>
        <form.AppField name="versionId">
          {(field: any) => <ControlForm field={field} item={values.versionId} showMessage={false} />}
        </form.AppField>
        <form.AppField name="questionLimit">
          {(field: any) => <ControlForm field={field} item={values.questionLimit} showMessage={false} />}
        </form.AppField>
        <form.AppField name="isRandomItem">
          {(field: any) => <ControlForm field={field} item={values.isRandomItem} showMessage={false} />}
        </form.AppField>
        <form.AppField name="isRandomChoice">
          {(field: any) => <ControlForm field={field} item={values.isRandomChoice} showMessage={false} />}
        </form.AppField>
      </TabsContent>
    </Tabs>
  );
};

export const DialogSectionForm = ({
  open,
  onOpenChange,
  section,
  packageId,
  packageIdDisabled = false,
  onSuccess,
}: DialogSectionFormProps) => {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const createMutation = useCreatePackageSection();
  const updateMutation = useUpdatePackageSection();

  // Fetch simplified package list for the selection dropdown
  const { data: packagesData } = useListPackageSimple({ limit: 1000 });

  const packageOptions = packagesData?.data.items || [];

  // Fetch version list
  const { data: versionsData } = useListVersionSimple({
    dataType: EnumContentType.EXAM,
    limit: 1000,
  });
  const versionOptions = (versionsData?.data.items || []).map((v: any) => ({
    value: v.id.toString(),
    label: `${v.id} - ${v.name}${v.published ? ` [${t(($) => $.labels.publishedText)}]` : ""}`,
  }));

  const formSchema: any = {
    packageId: z.string().min(
      1,
      t(($) => $.exam.sections.formPackageRequired),
    ),
    title: z.string().min(
      1,
      t(($) => $.exam.sections.formTitleRequired),
    ),
    groupName: z.string().optional(),
    description: z.string().optional(),
    durationMinutes: z.coerce.number().min(
      0,
      t(($) => $.exam.sections.formDurationRequired),
    ),
    isActive: z.boolean().default(true),
    versionId: z.coerce.number().min(
      1,
      t(($) => $.exam.sections.formVersionRequired),
    ),
    questionLimit: z.coerce.number().min(0, "Limit questions must be positive"),
    isRandomItem: z.boolean().default(true),
    isRandomChoice: z.boolean().default(true),
  };

  const formConfig: any = {
    packageId: {
      type: "combobox",
      name: "packageId",
      label: t(($) => $.exam.sections.formPackage),
      placeholder: t(($) => $.exam.sections.formPackagePlaceholder),
      options: packageOptions,
      required: true,
    },
    title: {
      type: "text",
      name: "title",
      label: t(($) => $.exam.sections.formTitle),
      placeholder: t(($) => $.exam.sections.formTitlePlaceholder),
      required: true,
    },
    groupName: {
      type: "text",
      name: "groupName",
      label: t(($) => $.exam.sections.formGroupName),
      placeholder: t(($) => $.exam.sections.formGroupNamePlaceholder),
    },
    description: {
      type: "textarea",
      name: "description",
      label: t(($) => $.exam.sections.formDescription),
      placeholder: t(($) => $.exam.sections.formDescriptionPlaceholder),
    },
    durationMinutes: {
      type: "select",
      name: "durationMinutes",
      label: t(($) => $.exam.sections.formDuration),
      placeholder: t(($) => $.exam.sections.formDurationPlaceholder),
      description: t(($) => $.exam.sections.formDurationHelp),
      options: durationOnMinutes,
    },
    questionLimit: {
      type: "number",
      name: "questionLimit",
      label: "Batas Jumlah Soal (Pool)",
      placeholder: "Contoh: 10 (0 untuk menampilkan semua)",
      description: "Jika diisi > 0, sistem akan mengacak & membatasi jumlah soal yang dikerjakan user per sesi",
    },
    isActive: {
      type: "switch",
      name: "isActive",
      label: t(($) => $.exam.sections.formActive),
      description: t(($) => $.exam.sections.formActiveHelp),
    },
    isRandomItem: {
      type: "switch",
      name: "isRandomItem",
      label: "Acak Urutan Soal",
      description: "Jika aktif, soal akan ditampilkan secara acak ke pengguna",
    },
    isRandomChoice: {
      type: "switch",
      name: "isRandomChoice",
      label: "Acak Opsi Jawaban",
      description: "Jika aktif, opsi jawaban (A, B, C, D) akan diacak urutannya",
    },
    versionId: {
      type: "combobox",
      name: "versionId",
      label: t(($) => $.exam.sections.formVersion),
      placeholder: t(($) => $.exam.sections.formVersionPlaceholder),
      options: versionOptions,
      required: true,
    },
  };

  const modalProps: ModalFormProps = {
    title: section ? t(($) => $.exam.sections.editTitle) : t(($) => $.exam.sections.createTitle),
    desc: section ? t(($) => $.exam.sections.editDesc) : t(($) => $.exam.sections.createDesc),
    modal: true,
    textConfirm:
      createMutation.isPending || updateMutation.isPending
        ? t(($) => $.labels.saving)
        : t(($) => $.labels.save),
    textCancel: t(($) => $.labels.cancel),
    defaultValue: {
      packageId: section?.packageId || packageId || "",
      title: section?.title || "",
      groupName: section?.groupName || "",
      description: section?.description || "",
      durationMinutes: (section?.durationMinutes ?? 0).toString(),
      isActive: section?.isActive ?? true,
      versionId: section?.versionId?.toString() || "",
      questionLimit: (section?.questionLimit ?? 0).toString(),
      isRandomItem: section?.isRandomItem ?? true,
      isRandomChoice: section?.isRandomChoice ?? true,
    },
    child: formConfig,
    schema: formSchema,
    content: <FormEntity packageIdDisabled={packageIdDisabled} />,
    onCancelClick: () => onOpenChange(false),
    onConfirmClick: async (values) => {
      if (section) {
        // EDIT MODE
        await updateMutation.mutateAsync(
          {
            id: section.id,
            packageId: values.packageId,
            title: values.title,
            groupName: values.groupName,
            description: values.description,
            durationMinutes:
              values.durationMinutes !== undefined && values.durationMinutes !== ""
                ? Number(values.durationMinutes)
                : 0,
            isActive: values.isActive,
            versionId: values.versionId ? Number(values.versionId) : undefined,
            questionLimit:
              values.questionLimit !== undefined && values.questionLimit !== ""
                ? Number(values.questionLimit)
                : 0,
            isRandomItem: values.isRandomItem,
            isRandomChoice: values.isRandomChoice,
          },
          {
            onSuccess: () => {
              showNotifSuccess({ message: t(($) => $.exam.sections.updateSuccess) });
              queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
              onSuccess?.();
              onOpenChange(false);
            },
            onError: (err: any) => {
              showNotifError({ message: err.message || t(($) => $.exam.sections.updateError) });
            },
          },
        );
      } else {
        // CREATE MODE
        await createMutation.mutateAsync(
          {
            packageId: values.packageId || packageId,
            title: values.title,
            groupName: values.groupName,
            description: values.description,
            durationMinutes:
              values.durationMinutes !== undefined && values.durationMinutes !== ""
                ? Number(values.durationMinutes)
                : 0,
            isActive: values.isActive,
            versionId: values.versionId ? Number(values.versionId) : undefined,
            questionLimit:
              values.questionLimit !== undefined && values.questionLimit !== ""
                ? Number(values.questionLimit)
                : 0,
            isRandomItem: values.isRandomItem,
            isRandomChoice: values.isRandomChoice,
          },
          {
            onSuccess: () => {
              showNotifSuccess({ message: t(($) => $.exam.sections.createSuccess) });
              queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
              onSuccess?.();
              onOpenChange(false);
            },
            onError: (err: any) => {
              showNotifError({ message: err.message || t(($) => $.exam.sections.createError) });
            },
          },
        );
      }
    },
  };

  if (!open) return null;

  return <DialogModalForm modal={modalProps} />;
};
