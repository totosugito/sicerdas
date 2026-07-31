import React, { useEffect, useRef } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { useListSubjectSimple } from "@/api/exam/subjects";
import { PassageFormValues } from "@/api/exam/passages/types";
import { Button } from "@/components/ui/button";
import { prepare_blocknote_submission } from "@/lib/blocknote-utils";

type PassageFormProps = {
  defaultValues?: Partial<PassageFormValues>;
  onSubmit: (data: FormData) => void;
  isPending?: boolean;
};

export function PassageForm({ defaultValues, onSubmit, isPending }: PassageFormProps) {
  const { t } = useAppTranslation();
  const pendingFiles = useRef<Map<string, File>>(new Map());

  const uploadFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    pendingFiles.current.set(url, file);
    return url;
  };

  // Fetch searchable subjects
  const { data: subjectsData, isFetching: isFetchingSubjects } = useListSubjectSimple({
    limit: 1000,
  });
  const subjectOptions = subjectsData?.data?.items || [];

  const formSchema = z.object({
    title: z.string().min(
      1,
      t(($) => $.exam.passages.form.title.required),
    ),
    subjectId: z.string().min(
      1,
      t(($) => $.exam.passages.form.subject.required),
    ),
    content: z.array(z.any()).optional(),
    isActive: z.boolean().default(true),
  });

  const form = useAppForm({
    defaultValues: {
      title: "",
      subjectId: "",
      content: [],
      isActive: true,
      ...defaultValues,
    } as PassageFormValues,
    validators: {
      onChange: formSchema as any,
    },
  });

  // Reset the form whenever defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        title: "",
        subjectId: "",
        content: [],
        isActive: true,
        ...defaultValues,
      });
    }
  }, [JSON.stringify(defaultValues), form]);

  const onFormSubmit = (values: PassageFormValues) => {
    const formData = new FormData();

    // 1. Prepare content for submission
    const { submissionContent, filesToUpload } = prepare_blocknote_submission(
      values.content || [],
      pendingFiles.current,
      { prefix: "passage" },
    );

    // 2. Add files
    filesToUpload.forEach(({ placeholder, file }) => {
      formData.append("files", file, placeholder);
    });

    // 3. Add data
    formData.append(
      "data",
      JSON.stringify({
        ...values,
        content: submissionContent,
      }),
    );

    onSubmit(formData);
  };

  const formConfig = {
    title: {
      type: "text",
      name: "title",
      label: t(($) => $.exam.passages.form.title.label),
      placeholder: t(($) => $.exam.passages.form.title.placeholder),
      required: true,
    },
    subjectId: {
      type: "combobox",
      name: "subjectId",
      label: t(($) => $.exam.passages.form.subject.label),
      placeholder: t(($) => $.exam.passages.form.subject.placeholder),
      options: subjectOptions,
      disabled: isFetchingSubjects,
      isLoading: isFetchingSubjects,
      required: true,
    },
    isActive: {
      type: "switch",
      name: "isActive",
      label: t(($) => $.exam.passages.form.isActive.label),
      description: t(($) => $.exam.passages.form.isActive.description),
    },
    content: {
      type: "blocknote",
      name: "content",
      label: t(($) => $.exam.passages.form.content.label),
      uploadFile,
    },
  };

  return (
    <form.AppForm>
      <FormWithDetector form={form} onSubmit={onFormSubmit} className="" errorClassName="mt-0 mb-6">
        <div className="border border-border rounded-lg bg-card p-6 space-y-6">
          <form.AppField name="title">
            {(field: any) => <ControlForm field={field} item={formConfig.title} showMessage={false} />}
          </form.AppField>

          <form.AppField name="subjectId">
            {(field: any) => <ControlForm field={field} item={formConfig.subjectId} showMessage={false} />}
          </form.AppField>

          <form.AppField name="isActive">
            {(field: any) => <ControlForm field={field} item={formConfig.isActive} showMessage={false} />}
          </form.AppField>

          <form.AppField name="content">
            {(field: any) => <ControlForm field={field} item={formConfig.content} />}
          </form.AppField>

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
    </form.AppForm>
  );
}
