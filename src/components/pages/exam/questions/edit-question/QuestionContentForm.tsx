import React, { useEffect, useRef, useMemo } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms";
import { FormWithDetector } from "@/components/custom/components";
import { resolve_blocknote_urls, prepare_blocknote_submission } from "@/lib/blocknote-utils";

type QuestionContentFormProps = {
  defaultValues: any;
  onSubmit: (values: FormData) => void;
  isPending?: boolean;
};

const formSchema = z.object({
  content: z.array(z.record(z.string(), z.unknown())).min(1),
  reasonContent: z.array(z.record(z.string(), z.unknown())).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionContentForm({
  defaultValues,
  onSubmit,
  isPending,
}: QuestionContentFormProps) {
  const { t } = useAppTranslation();
  const pendingFiles = useRef<Map<string, File>>(new Map());
  const uploadsUrl = import.meta.env.VITE_APP_BASE_URL;

  const resolvedDefaultValues = useMemo(() => {
    return {
      ...defaultValues,
      content: resolve_blocknote_urls(defaultValues.content || [], uploadsUrl),
      reasonContent: resolve_blocknote_urls(defaultValues.reasonContent || [], uploadsUrl),
    };
  }, [defaultValues, uploadsUrl]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: resolvedDefaultValues,
  });

  useEffect(() => {
    form.reset(resolvedDefaultValues);
    // Clear pending files on reset/mount
    pendingFiles.current.clear();
  }, [resolvedDefaultValues, form]);

  const onFormSubmit = (values: FormValues) => {
    const formData = new FormData();

    // 1. Prepare content for submission (replaces blobs with upload_ placeholders)
    const { submissionContent, filesToUpload } = prepare_blocknote_submission(
      values.content,
      pendingFiles.current,
    );

    const { submissionContent: submissionReasonContent, filesToUpload: reasonFiles } =
      prepare_blocknote_submission(values.reasonContent, pendingFiles.current);

    // 2. Add files with placeholder names
    const allFilesToUpload = [...filesToUpload, ...reasonFiles];
    allFilesToUpload.forEach(({ placeholder, file }) => {
      formData.append("files", file, placeholder);
    });

    // 3. Add the rest of the form data as a JSON string
    formData.append(
      "data",
      JSON.stringify({
        ...defaultValues,
        ...values,
        content: submissionContent,
        reasonContent: submissionReasonContent,
      }),
    );

    onSubmit(formData);
  };

  const uploadFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    pendingFiles.current.set(url, file);
    return url;
  };

  const type = defaultValues.type;
  const isReasoning = type === "statement_reasoning";

  const formConfig = {
    content: {
      type: "blocknote",
      name: "content",
      label: t(($) => $.exam.questions.form.content.label),
      placeholder: t(($) => $.exam.questions.form.content.placeholder),
      minHeight: isReasoning ? "200px" : "300px",
      uploadFile,
    },
    reasonContent: {
      type: "blocknote",
      name: "reasonContent",
      label: t(($) => $.exam.questions.form.reasonContent.label),
      placeholder: t(($) => $.exam.questions.form.reasonContent.placeholder),
      minHeight: isReasoning ? "200px" : "300px",
      uploadFile,
    },
  };

  return (
    <Form {...form}>
      <FormWithDetector
        form={form}
        onSubmit={onFormSubmit}
        schema={formSchema}
        className="space-y-6"
      >
        <ControlForm form={form} item={formConfig.content} />

        {isReasoning && (
          <div className="pt-6 border-t border-dashed">
            <ControlForm form={form} item={formConfig.reasonContent} />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isPending}>
            {t(($) => $.labels.cancel)}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t(($) => $.labels.saving) : t(($) => $.labels.save)}
          </Button>
        </div>
      </FormWithDetector>
    </Form>
  );
}
