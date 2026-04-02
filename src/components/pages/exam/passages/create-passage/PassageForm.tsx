import React, { useCallback, useEffect, Suspense, lazy, ComponentType } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms";
import { FormWithDetector } from "@/components/custom/components";
import { useListSubjectSimple } from "@/api/exam-subjects";
import { PassageFormValues } from "@/api/exam-passages/types";
import { BlockNoteEditorProps } from "@/components/custom/components/BlockNoteEditor";

const LazyBlockNoteEditor = lazy(() =>
  import("@/components/custom/components/BlockNoteEditor").then((m) => ({
    default: m.BlockNoteEditor as ComponentType<BlockNoteEditorProps<PassageFormValues>>,
  })),
);

type PassageFormProps = {
  defaultValues?: Partial<PassageFormValues>;
  onSubmit: (values: PassageFormValues) => void;
  isPending?: boolean;
};

export function PassageForm({ defaultValues, onSubmit, isPending }: PassageFormProps) {
  const { t } = useAppTranslation();

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

  const form = useForm<PassageFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      subjectId: "",
      content: [],
      isActive: true,
      ...defaultValues,
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
  }, [defaultValues, form]);

  const handleContentChange = useCallback(
    (content: any[]) => {
      form.setValue("content", content, { shouldDirty: true, shouldTouch: true });
    },
    [form],
  );

  const onFormSubmit = (values: PassageFormValues) => {
    onSubmit(values);
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
  };

  return (
    <Form {...form}>
      <FormWithDetector form={form} onSubmit={onFormSubmit} schema={formSchema} className="">
        <div className="border border-border rounded-lg bg-card p-6 space-y-6">
          <ControlForm form={form} item={formConfig.title} showMessage={false} />

          <ControlForm form={form} item={formConfig.subjectId} showMessage={false} />

          <ControlForm form={form} item={formConfig.isActive} showMessage={false} />

          <Suspense
            fallback={<div className="min-h-[300px] rounded-md border bg-muted animate-pulse" />}
          >
            <LazyBlockNoteEditor
              form={form}
              fieldName="content"
              label={t(($) => $.exam.passages.form.content.label)}
              defaultValues={defaultValues}
              isPending={isPending}
              onContentChange={handleContentChange}
            />
          </Suspense>
        </div>
      </FormWithDetector>
    </Form>
  );
}
