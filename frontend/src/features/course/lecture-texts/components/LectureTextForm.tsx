import React, { useEffect, useRef } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Save } from "lucide-react";
import { prepare_blocknote_submission } from "@/lib/blocknote-utils";
import { useListCategorySimple } from "@/api/education/categories";
import { useListGradeSimple } from "@/api/education/grades";
import { EnumContentStatus } from "@/api/types";

export type LectureTextFormValues = {
  title: string;
  content: Array<Record<string, any>>;
  categoryId?: string | null;
  educationGradeId?: number | null;
  status?: string;
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

  const { data: categoriesData, isLoading: isLoadingCategories } = useListCategorySimple({ limit: 1000 });
  const { data: gradesData, isLoading: isLoadingGrades } = useListGradeSimple({ limit: 1000 });

  const categoryOptions = (categoriesData?.data?.items || []).map((cat) => ({
    label: cat.label,
    value: cat.value,
  }));

  const gradeOptions = (gradesData?.data?.items || []).map((grade) => ({
    label: grade.label,
    value: grade.value,
  }));

  const statusOptions = Object.entries(EnumContentStatus).map(([_, val]) => ({
    label: val.charAt(0).toUpperCase() + val.slice(1),
    value: val,
  }));

  const formSchema = z.object({
    title: z.string().min(1, t(($) => $.course.lectureTexts.titleRequired)),
    content: z.array(z.record(z.string(), z.any())),
    categoryId: z.string().nullable().optional(),
    educationGradeId: z.coerce.number().nullable().optional(),
    status: z.string().optional(),
  });

  const form = useAppForm({
    defaultValues: {
      title: defaultValues?.title || "",
      content: defaultValues?.content || [],
      categoryId: defaultValues?.categoryId ?? null,
      educationGradeId: defaultValues?.educationGradeId ?? null,
      status: defaultValues?.status || EnumContentStatus.DRAFT,
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
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
                </div>

                <form.AppField name="categoryId">
                  {(field) => (
                    <ControlForm
                      field={field}
                      item={{
                        type: "combobox",
                        label: t(($) => $.course.courses.form.categoryId.label),
                        placeholder: t(($) => $.course.courses.form.categoryId.placeholder),
                        options: categoryOptions,
                        isLoading: isLoadingCategories,
                      }}
                      showMessage={false}
                    />
                  )}
                </form.AppField>

                <form.AppField name="educationGradeId">
                  {(field) => (
                    <ControlForm
                      field={field}
                      item={{
                        type: "combobox",
                        label: t(($) => $.course.courses.form.educationGradeId.label),
                        placeholder: t(($) => $.course.courses.form.educationGradeId.placeholder),
                        options: gradeOptions,
                        isLoading: isLoadingGrades,
                      }}
                      showMessage={false}
                    />
                  )}
                </form.AppField>

                <form.AppField name="status">
                  {(field) => (
                    <ControlForm
                      field={field}
                      item={{
                        type: "select",
                        label: t(($) => $.labels.status),
                        options: statusOptions,
                      }}
                      showMessage={false}
                    />
                  )}
                </form.AppField>
              </div>

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
