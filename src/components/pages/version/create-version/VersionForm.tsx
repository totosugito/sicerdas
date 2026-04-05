import React, { useEffect } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms";
import { FormWithDetector } from "@/components/custom/components";
import { CreateVersionRequest } from "@/api/version";
import { EnumContentStatus, EnumContentType } from "backend/src/db/schema/enum/enum-app";
import { Button } from "@/components/ui/button";

type VersionFormProps = {
  defaultValues?: Partial<CreateVersionRequest>;
  onSubmit: (values: CreateVersionRequest) => void;
  isPending?: boolean;
};

export function VersionForm({ defaultValues, onSubmit, isPending }: VersionFormProps) {
  const { t } = useAppTranslation();

  const formSchema = z.object({
    appVersion: z.number({ message: t(($) => $.version.form.appVersion.required) }),
    dbVersion: z.number({ message: t(($) => $.version.form.dbVersion.required) }),
    dataType: z.string().min(
      1,
      t(($) => $.version.form.dataType.required),
    ),
    status: z
      .string()
      .min(
        1,
        t(($) => $.version.form.status.required),
      )
      .optional(),
    name: z.string().min(
      1,
      t(($) => $.version.form.name.required),
    ),
    note: z.array(z.any()).optional(),
    extra: z.record(z.string(), z.any()).optional(),
  });

  const form = useForm<CreateVersionRequest>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      appVersion: 1,
      dbVersion: 1,
      name: "",
      dataType: EnumContentType.BOOK,
      status: EnumContentStatus.PUBLISHED,
      note: [],
      extra: {},
      ...defaultValues,
    },
  });

  // Reset the form whenever defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        appVersion: 1,
        dbVersion: 1,
        name: "",
        dataType: EnumContentType.BOOK,
        status: EnumContentStatus.PUBLISHED,
        note: [],
        extra: {},
        ...defaultValues,
      });
    }
  }, [defaultValues, form]);

  const onFormSubmit = (values: CreateVersionRequest) => {
    onSubmit(values);
  };

  const dataTypeOptions = [
    { value: EnumContentType.BOOK, label: t(($) => $.version.form.dataType.options.book) },
    { value: EnumContentType.EXAM, label: t(($) => $.version.form.dataType.options.exam) },
    { value: EnumContentType.TEST, label: t(($) => $.version.form.dataType.options.test) },
    { value: EnumContentType.COURSE, label: t(($) => $.version.form.dataType.options.course) },
    { value: EnumContentType.OTHER, label: t(($) => $.version.form.dataType.options.other) },
  ];

  const statusOptions = [
    {
      value: EnumContentStatus.PUBLISHED,
      label: t(($) => $.version.form.status.options.published),
    },
    {
      value: EnumContentStatus.UNPUBLISHED,
      label: t(($) => $.version.form.status.options.unpublished),
    },
    { value: EnumContentStatus.ARCHIVED, label: t(($) => $.version.form.status.options.archived) },
    { value: EnumContentStatus.DELETED, label: t(($) => $.version.form.status.options.deleted) },
  ];

  const formConfig = {
    name: {
      type: "text",
      name: "name",
      label: t(($) => $.version.form.name.label),
      placeholder: t(($) => $.version.form.name.placeholder),
      required: true,
    },
    appVersion: {
      type: "number",
      name: "appVersion",
      label: t(($) => $.version.form.appVersion.label),
      placeholder: t(($) => $.version.form.appVersion.placeholder),
      required: true,
      useThousandSeparator: false,
    },
    dbVersion: {
      type: "number",
      name: "dbVersion",
      label: t(($) => $.version.form.dbVersion.label),
      placeholder: t(($) => $.version.form.dbVersion.placeholder),
      required: true,
      useThousandSeparator: false,
    },
    dataType: {
      type: "select",
      name: "dataType",
      label: t(($) => $.version.form.dataType.label),
      placeholder: t(($) => $.version.form.dataType.placeholder),
      options: dataTypeOptions,
      required: true,
    },
    status: {
      type: "select",
      name: "status",
      label: t(($) => $.version.form.status.label),
      placeholder: t(($) => $.version.form.status.placeholder),
      options: statusOptions,
    },
    note: {
      type: "blocknote",
      name: "note",
      label: t(($) => $.version.form.note.label),
    },
  };

  return (
    <Form {...form}>
      <FormWithDetector form={form} onSubmit={onFormSubmit} schema={formSchema}>
        <div className="border border-border rounded-lg bg-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ControlForm form={form} item={formConfig.name} showMessage={false} />
            <ControlForm form={form} item={formConfig.dataType} showMessage={false} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ControlForm form={form} item={formConfig.appVersion} showMessage={false} />
            <ControlForm form={form} item={formConfig.dbVersion} showMessage={false} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ControlForm form={form} item={formConfig.status} showMessage={false} />
          </div>

          <ControlForm form={form} item={formConfig.note} />

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              {t(($) => $.labels.cancel)}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t(($) => $.labels.saving) : t(($) => $.labels.save)}
            </Button>
          </div>
        </div>
      </FormWithDetector>
    </Form>
  );
}
