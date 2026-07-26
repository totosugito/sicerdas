import React, { useEffect, useRef } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form-tanstack";
import { z } from "zod";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { prepare_blocknote_submission } from "@/lib/blocknote-utils";

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

  const form = useAppForm({
    defaultValues: {
      content: defaultValues.content || [],
      reasonContent: defaultValues.reasonContent || [],
    } as FormValues,
    validators: {
      onChange: formSchema as any,
    },
  });

  useEffect(() => {
    form.reset({
      content: defaultValues.content || [],
      reasonContent: defaultValues.reasonContent || [],
    });
    // Clear pending files on reset/mount
    pendingFiles.current.clear();
  }, [JSON.stringify(defaultValues)]);

  const onFormSubmit = (values: FormValues) => {
    const formData = new FormData();

    // 1. Prepare content for submission (replaces blobs with upload_ placeholders)
    const { submissionContent, filesToUpload } = prepare_blocknote_submission(
      values.content,
      pendingFiles.current,
      { prefix: "question" },
    );

    const { submissionContent: submissionReasonContent, filesToUpload: reasonFiles } =
      prepare_blocknote_submission(values.reasonContent, pendingFiles.current, {
        prefix: "question",
      });

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
    <form.AppForm>
      <FormWithDetector
        form={form}
        onSubmit={onFormSubmit}
        errorClassName="mt-0 mb-6"
        className="space-y-6"
      >
        <form.AppField name="content">
          {(field) => <ControlForm field={field} item={formConfig.content} />}
        </form.AppField>

        {isReasoning && (
          <div className="pt-6 border-t border-dashed">
            <form.AppField name="reasonContent">
              {(field) => <ControlForm field={field} item={formConfig.reasonContent} />}
            </form.AppField>
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
    </form.AppForm>
  );
}

