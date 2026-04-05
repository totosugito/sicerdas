import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { ControlForm } from "@/components/custom/forms";
import * as z from "zod";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  useCreatePackageSection,
  useUpdatePackageSection,
  ExamPackageSection,
} from "@/api/exam-package-sections";
import { useListPackageSimple } from "@/api/exam-packages";
import { useListVersionSimple } from "@/api/version";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { durationOnMinutes } from "@/constants/app-enum";
import { EnumContentType } from "backend/src/db/schema/enum/enum-app";

export type DialogSectionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: ExamPackageSection | null;
  packageId?: string;
  packageIdDisabled?: boolean;
};

const FormEntity = ({ values, form, packageIdDisabled }: any) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {values.packageId && (
        <ControlForm
          form={form}
          item={values.packageId}
          showMessage={false}
          disabled={packageIdDisabled}
        />
      )}
      <ControlForm form={form} item={values.title} showMessage={false} />
      <ControlForm form={form} item={values.description} showMessage={false} />
      <ControlForm form={form} item={values.durationMinutes} showMessage={false} />
      <ControlForm form={form} item={values.versionId} showMessage={false} />
      <ControlForm form={form} item={values.isActive} showMessage={false} />
    </div>
  );
};

export const DialogSectionForm = ({
  open,
  onOpenChange,
  section,
  packageId,
  packageIdDisabled = false,
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
    label: `${v.id} - ${v.name}${v.published ? ` [${t(($) => $.labels.published)}]` : ""}`,
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
    isActive: {
      type: "switch",
      name: "isActive",
      label: t(($) => $.exam.sections.formActive),
      description: t(($) => $.exam.sections.formActiveHelp),
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
      description: section?.description || "",
      durationMinutes: (section?.durationMinutes ?? 0).toString(),
      isActive: section?.isActive ?? true,
      versionId: section?.versionId?.toString() || "",
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
            description: values.description,
            durationMinutes:
              values.durationMinutes !== undefined && values.durationMinutes !== ""
                ? Number(values.durationMinutes)
                : 0,
            isActive: values.isActive,
            versionId: values.versionId ? Number(values.versionId) : undefined,
          },
          {
            onSuccess: () => {
              showNotifSuccess({ message: t(($) => $.exam.sections.updateSuccess) });
              queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
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
            description: values.description,
            durationMinutes:
              values.durationMinutes !== undefined && values.durationMinutes !== ""
                ? Number(values.durationMinutes)
                : 0,
            isActive: values.isActive,
            versionId: values.versionId ? Number(values.versionId) : undefined,
          },
          {
            onSuccess: () => {
              showNotifSuccess({ message: t(($) => $.exam.sections.createSuccess) });
              queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
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
