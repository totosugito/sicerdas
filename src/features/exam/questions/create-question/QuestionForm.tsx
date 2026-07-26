import React, { useEffect, useRef } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { useListSubjectSimple } from "@/api/exam/subjects";
import { useListPassageSimple } from "@/api/exam/passages";
import { useListTier } from "@/api/tier";
import { useListGradeSimple } from "@/api/education/grades";
import {
  QuestionFormValues,
  EnumDifficultyLevel,
  EnumQuestionType,
  EnumScoringStrategy,
} from "@/api/exam/questions/types";
import { prepare_blocknote_submission } from "@/lib/blocknote-utils";

type InternalQuestionFormValues = Omit<QuestionFormValues, "educationGradeId"> & {
  educationGradeId?: string | number | null;
};

type QuestionFormProps = {
  defaultValues?: Partial<QuestionFormValues>;
  onSubmit: (values: FormData) => void;
  isPending?: boolean;
};

export function QuestionForm({ defaultValues, onSubmit, isPending }: QuestionFormProps) {
  const { t } = useAppTranslation();
  const pendingFiles = useRef<Map<string, File>>(new Map());

  // Data for dropdowns (Fetching all active options at once)
  const { data: subjectsData, isFetching: isFetchingSubjects } = useListSubjectSimple({
    limit: 1000,
  });
  const { data: passagesData, isFetching: isFetchingPassages } = useListPassageSimple({
    limit: 1000,
  });
  const { data: gradesData, isFetching: isFetchingGrades } = useListGradeSimple({ limit: 1000 });
  const { data: tierData, isLoading: isLoadingTier } = useListTier();

  const subjectOptions = subjectsData?.data?.items || [];
  const passageOptions = passagesData?.data?.items || [];
  const gradeOptions = gradesData?.data?.items || [];

  const formSchema = z.object({
    subjectId: z.string().min(
      1,
      t(($) => $.exam.questions.form.subject.required),
    ),
    passageId: z.string().nullable().optional(),
    content: z.array(z.any()).optional(),
    reasonContent: z.array(z.any()).optional(),
    difficulty: z.enum(Object.values(EnumDifficultyLevel) as [string, ...string[]]),
    type: z.enum(Object.values(EnumQuestionType) as [string, ...string[]]),
    maxScore: z
      .number()
      .min(
        0,
        t(($) => $.exam.questions.form.maxScore.required),
      )
      .default(1),
    scoringStrategy: z.string().optional(),
    requiredTier: z.string().nullable().optional(),
    educationGradeId: z.union([z.number(), z.string(), z.null()]).optional(),
    isActive: z.boolean().default(true),
  });

  const form = useAppForm({
    defaultValues: {
      subjectId: defaultValues?.subjectId || "",
      passageId: defaultValues?.passageId || null,
      content: defaultValues?.content || [],
      reasonContent: defaultValues?.reasonContent || [],
      difficulty: defaultValues?.difficulty || EnumDifficultyLevel.MEDIUM,
      type: defaultValues?.type || EnumQuestionType.MULTIPLE_CHOICE,
      maxScore: defaultValues?.maxScore ?? 1,
      scoringStrategy: defaultValues?.scoringStrategy || EnumScoringStrategy.ALL_OR_NOTHING,
      requiredTier: defaultValues?.requiredTier || "free",
      educationGradeId: defaultValues?.educationGradeId || "",
      isActive: defaultValues?.isActive ?? true,
    } as InternalQuestionFormValues,
    validators: {
      onChange: formSchema as any,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        subjectId: defaultValues.subjectId || "",
        passageId: defaultValues.passageId || null,
        content: defaultValues.content || [],
        reasonContent: defaultValues.reasonContent || [],
        difficulty: defaultValues.difficulty || EnumDifficultyLevel.MEDIUM,
        type: defaultValues.type || EnumQuestionType.MULTIPLE_CHOICE,
        maxScore: defaultValues.maxScore ?? 1,
        scoringStrategy: defaultValues.scoringStrategy || EnumScoringStrategy.ALL_OR_NOTHING,
        requiredTier: defaultValues.requiredTier || "free",
        educationGradeId: defaultValues.educationGradeId || "",
        isActive: defaultValues.isActive ?? true,
      });
    }
  }, [JSON.stringify(defaultValues)]);

  const onFormSubmit = (values: any) => {
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

  const tierOptions =
    tierData?.data?.map((tier: any) => ({
      label: tier.name,
      value: tier.slug,
    })) || [];

  const difficultyOptions = [
    {
      label: t(($) => $.exam.questions.form.difficulty.options.easy),
      value: EnumDifficultyLevel.EASY,
    },
    {
      label: t(($) => $.exam.questions.form.difficulty.options.medium),
      value: EnumDifficultyLevel.MEDIUM,
    },
    {
      label: t(($) => $.exam.questions.form.difficulty.options.hard),
      value: EnumDifficultyLevel.HARD,
    },
  ];

  const typeOptions = [
    {
      label: t(($) => $.exam.questions.form.type.options.multiple_choice),
      value: EnumQuestionType.MULTIPLE_CHOICE,
    },
    {
      label: t(($) => $.exam.questions.form.type.options.multiple_select),
      value: EnumQuestionType.MULTIPLE_SELECT,
    },
    { label: t(($) => $.exam.questions.form.type.options.essay), value: EnumQuestionType.ESSAY },
    {
      label: t(($) => $.exam.questions.form.type.options.statement_reasoning),
      value: EnumQuestionType.STATEMENT_REASONING,
    },
  ];

  const scoringStrategyOptions = [
    {
      label: t(($) => $.exam.questions.form.scoringStrategy.options.all_or_nothing),
      value: EnumScoringStrategy.ALL_OR_NOTHING,
    },
    {
      label: t(($) => $.exam.questions.form.scoringStrategy.options.partial),
      value: EnumScoringStrategy.PARTIAL,
    },
    {
      label: t(($) => $.exam.questions.form.scoringStrategy.options.partial_with_penalty),
      value: EnumScoringStrategy.PARTIAL_WITH_PENALTY,
    },
  ];

  return (
    <form.Subscribe selector={(state: any) => state.values.type}>
      {(type: any) => {
        const isMultipleChoice = type === EnumQuestionType.MULTIPLE_CHOICE;

        const formConfig = {
          subjectId: {
            type: "combobox",
            name: "subjectId",
            label: t(($) => $.exam.questions.form.subject.label),
            placeholder: t(($) => $.exam.questions.form.subject.placeholder),
            options: subjectOptions,
            disabled: isFetchingSubjects,
            isLoading: isFetchingSubjects,
            required: true,
          },
          passageId: {
            type: "combobox",
            name: "passageId",
            label: t(($) => $.exam.questions.form.passage.label),
            placeholder: t(($) => $.exam.questions.form.passage.placeholder),
            options: passageOptions,
            disabled: isFetchingPassages,
            isLoading: isFetchingPassages,
          },
          difficulty: {
            type: "select",
            name: "difficulty",
            label: t(($) => $.exam.questions.form.difficulty.label),
            placeholder: t(($) => $.exam.questions.form.difficulty.placeholder),
            options: difficultyOptions,
          },
          type: {
            type: "select",
            name: "type",
            label: t(($) => $.exam.questions.form.type.label),
            placeholder: t(($) => $.exam.questions.form.type.placeholder),
            options: typeOptions,
          },
          maxScore: {
            type: "number",
            name: "maxScore",
            label: t(($) => $.exam.questions.form.maxScore.label),
            placeholder: t(($) => $.exam.questions.form.maxScore.placeholder),
            required: true,
          },
          scoringStrategy: {
            type: "select",
            name: "scoringStrategy",
            label: t(($) => $.exam.questions.form.scoringStrategy.label),
            placeholder: t(($) => $.exam.questions.form.scoringStrategy.placeholder),
            options: scoringStrategyOptions,
            disabled: isMultipleChoice,
          },
          requiredTier: {
            type: "select",
            name: "requiredTier",
            label: t(($) => $.exam.questions.form.requiredTier.label),
            placeholder: t(($) => $.exam.questions.form.requiredTier.placeholder),
            options: tierOptions,
            disabled: isLoadingTier,
          },
          educationGradeId: {
            type: "combobox",
            name: "educationGradeId",
            label: t(($) => $.exam.questions.form.educationGrade.label),
            placeholder: t(($) => $.exam.questions.form.educationGrade.placeholder),
            options: gradeOptions,
            disabled: isFetchingGrades,
            isLoading: isFetchingGrades,
          },
          isActive: {
            type: "switch",
            name: "isActive",
            label: t(($) => $.exam.questions.form.isActive.label),
            description: t(($) => $.exam.questions.form.isActive.description),
          },
          content: {
            type: "blocknote",
            name: "content",
            label: t(($) => $.exam.questions.form.content.label),
            minHeight: type === EnumQuestionType.STATEMENT_REASONING ? "200px" : "350px",
            uploadFile,
          },
          reasonContent: {
            type: "blocknote",
            name: "reasonContent",
            label: t(($) => $.exam.questions.form.reasonContent.label),
            minHeight: type === EnumQuestionType.STATEMENT_REASONING ? "200px" : "300px",
            uploadFile,
          },
        };

        return (
          <form.AppForm>
            <FormWithDetector form={form} onSubmit={onFormSubmit} errorClassName="mt-0 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border rounded-lg bg-card p-6 space-y-6">
                  <form.AppField name="subjectId">
                    {(field) => <ControlForm field={field} item={formConfig.subjectId} showMessage={false} />}
                  </form.AppField>

                  <form.AppField name="passageId">
                    {(field) => <ControlForm field={field} item={formConfig.passageId} showMessage={false} />}
                  </form.AppField>

                  <div className="grid grid-cols-2 gap-4">
                    <form.AppField name="difficulty">
                      {(field) => <ControlForm field={field} item={formConfig.difficulty} showMessage={false} />}
                    </form.AppField>
                    <form.AppField name="type">
                      {(field) => <ControlForm field={field} item={formConfig.type} showMessage={false} />}
                    </form.AppField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <form.AppField name="maxScore">
                      {(field) => <ControlForm field={field} item={formConfig.maxScore} showMessage={false} />}
                    </form.AppField>
                    <form.AppField name="scoringStrategy">
                      {(field) => <ControlForm field={field} item={formConfig.scoringStrategy} showMessage={false} />}
                    </form.AppField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <form.AppField name="requiredTier">
                      {(field) => <ControlForm field={field} item={formConfig.requiredTier} showMessage={false} />}
                    </form.AppField>
                    <form.AppField name="educationGradeId">
                      {(field) => <ControlForm field={field} item={formConfig.educationGradeId} showMessage={false} />}
                    </form.AppField>
                  </div>

                  <form.AppField name="isActive">
                    {(field) => <ControlForm field={field} item={formConfig.isActive} showMessage={false} />}
                  </form.AppField>
                </div>

                <div className="border border-border rounded-lg bg-card p-6 space-y-6 flex flex-col">
                  <form.AppField name="content">
                    {(field) => (
                      <ControlForm
                        field={field}
                        item={formConfig.content}
                        showMessage={false}
                        className="flex-1"
                      />
                    )}
                  </form.AppField>

                  {type === EnumQuestionType.STATEMENT_REASONING && (
                    <form.AppField name="reasonContent">
                      {(field) => (
                        <ControlForm
                          field={field}
                          item={formConfig.reasonContent}
                          showMessage={false}
                          className="flex-1"
                          wrapperClassName="pt-4 border-t border-dashed"
                        />
                      )}
                    </form.AppField>
                  )}

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                      }}
                    >
                      {t(($) => $.labels.cancel)}
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? t(($) => $.labels.saving) : t(($) => $.labels.save)}
                    </Button>
                  </div>
                </div>
              </div>
            </FormWithDetector>
          </form.AppForm>
        );
      }}
    </form.Subscribe>
  );
}

