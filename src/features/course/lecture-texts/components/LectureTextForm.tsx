import React, { useEffect, useRef } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Save } from "lucide-react";
import { prepare_blocknote_submission } from "@/lib/blocknote-utils";

export type LectureTextFormValues = {
  title: string;
  content: Array<Record<string, any>>;
};

type LectureTextFormProps = {
  defaultValues?: Partial<LectureTextFormValues>;
  onSubmit: (values: FormData | LectureTextFormValues) => void;
  isPending?: boolean;
  onCancel?: () => void;
};

export function LectureTextForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: LectureTextFormProps) {
  const { t } = useAppTranslation();
  const pendingFiles = useRef<Map<string, File>>(new Map());

  const formSchema = z.object({
    title: z.string().min(1, t(($) => $.course.lectureTexts.titleRequired)),
    content: z.array(z.record(z.string(), z.any())),
  });

  const form = useAppForm({
    defaultValues: {
      title: defaultValues?.title || "",
      content: defaultValues?.content || [],
    },
    validators: {
      onChange: formSchema as any,
    },
  });

  useEffect(() => {
    pendingFiles.current.clear();
  }, [JSON.stringify(defaultValues)]);

  const uploadFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    pendingFiles.current.set(url, file);
    return url;
  };

  const handleFormSubmit = (values: LectureTextFormValues) => {
    const { submissionContent, filesToUpload } = prepare_blocknote_submission(
      values.content,
      pendingFiles.current,
      { prefix: "lecture_text" },
    );

    if (filesToUpload.length > 0) {
      const formData = new FormData();
      filesToUpload.forEach(({ placeholder, file }) => {
        formData.append("files", file, placeholder);
      });
      formData.append(
        "data",
        JSON.stringify({
          ...values,
          content: submissionContent,
        }),
      );
      onSubmit(formData);
    } else {
      onSubmit({
        ...values,
        content: submissionContent,
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2 border-b pb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg text-foreground">
            {t(($) => $.course.lectureTexts.title)}
          </h3>
        </div>

        <form.AppForm>
          <FormWithDetector
            form={form}
            onSubmit={(values) => {
              handleFormSubmit(values as LectureTextFormValues);
            }}
            errorClassName="mt-0 mb-6"
          >
            <div className="space-y-6">
              <form.AppField name="title">
                {(field) => (
                  <ControlForm
                    field={field}
                    item={{
                      type: "text",
                      label: t(($) => $.course.lectureTexts.table.title),
                      placeholder: t(($) => $.course.lectureTexts.titlePlaceholder),
                      required: true,
                    }}
                    showMessage={false}
                  />
                )}
              </form.AppField>

              <form.AppField name="content">
                {(field) => (
                  <ControlForm
                    field={field}
                    item={{
                      type: "blocknote",
                      label: t(($) => $.course.lectureTexts.contentLabel),
                      minHeight: "350px",
                      uploadFile,
                    }}
                  />
                )}
              </form.AppField>

              <div className="flex justify-end gap-3 pt-4 border-t">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    {t(($) => $.labels.cancel)}
                  </Button>
                )}
                <Button type="submit" disabled={isPending} className="gap-2">
                  <Save className="h-4 w-4" />
                  <span>{isPending ? t(($) => $.labels.saving) : t(($) => $.labels.save)}</span>
                </Button>
              </div>
            </div>
          </FormWithDetector>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
