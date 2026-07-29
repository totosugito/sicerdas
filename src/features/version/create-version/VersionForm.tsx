import React, { useEffect } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { CreateVersionRequest } from "@/api/version";
import { EnumContentStatus, EnumContentType } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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

  const form = useAppForm({
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
    validators: {
      onChange: formSchema as any,
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
  }, [JSON.stringify(defaultValues)]);

  const onFormSubmit = (values: any) => {
    onSubmit(values as CreateVersionRequest);
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
      label: t(($) => $.labels.statusValues.published),
    },
    {
      value: EnumContentStatus.UNPUBLISHED,
      label: t(($) => $.labels.statusValues.unpublished),
    },
    { value: EnumContentStatus.ARCHIVED, label: t(($) => $.labels.statusValues.archived) },
    { value: EnumContentStatus.DELETED, label: t(($) => $.labels.statusValues.deleted) },
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
    <form.AppForm>
      <FormWithDetector form={form} onSubmit={onFormSubmit} errorClassName="mt-0 mb-6">
        <Card className="pb-0 gap-0">
          <CardContent className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form.AppField name="name">
                {(field: any) => (
                  <ControlForm field={field} item={formConfig.name} showMessage={false} />
                )}
              </form.AppField>
              <form.AppField name="dataType">
                {(field: any) => (
                  <ControlForm field={field} item={formConfig.dataType} showMessage={false} />
                )}
              </form.AppField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form.AppField name="appVersion">
                {(field: any) => (
                  <ControlForm field={field} item={formConfig.appVersion} showMessage={false} />
                )}
              </form.AppField>
              <form.AppField name="dbVersion">
                {(field: any) => (
                  <ControlForm field={field} item={formConfig.dbVersion} showMessage={false} />
                )}
              </form.AppField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form.AppField name="status">
                {(field: any) => (
                  <ControlForm field={field} item={formConfig.status} showMessage={false} />
                )}
              </form.AppField>
            </div>

            <form.AppField name="note">
              {(field: any) => (
                <ControlForm field={field} item={formConfig.note} />
              )}
            </form.AppField>
          </CardContent>

          <CardFooter className="flex justify-end items-center gap-3 bg-muted/30 border-t [.border-t]:pb-6">
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
          </CardFooter>
        </Card>
      </FormWithDetector>
    </form.AppForm>
  );
}
