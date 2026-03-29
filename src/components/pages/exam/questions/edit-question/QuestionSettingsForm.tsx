import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms";
import { FormWithDetector } from "@/components/custom/components";
import { useListSubjectSimple } from "@/api/exam-subjects";
import { useListPassageSimple } from "@/api/exam-passages";
import { useListTier } from "@/api/app-tier";
import { useListGradeSimple } from "@/api/education-grade";
import { ExamQuestion, EnumDifficultyLevel, EnumQuestionType } from "@/api/exam-questions/types";

type QuestionSettingsFormProps = {
  defaultValues: any;
  onSubmit: (values: Partial<ExamQuestion>) => void;
  isPending?: boolean;
};

export function QuestionSettingsForm({
  defaultValues,
  onSubmit,
  isPending,
}: QuestionSettingsFormProps) {
  const { t } = useAppTranslation();

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
    difficulty: z.enum(Object.values(EnumDifficultyLevel) as [string, ...string[]]),
    type: z.enum(Object.values(EnumQuestionType) as [string, ...string[]]),
    requiredTier: z.string().nullable().optional(),
    educationGradeId: z.union([z.number(), z.string(), z.null()]).optional(),
    isActive: z.boolean().default(true),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: defaultValues.subjectId || "",
      passageId: defaultValues.passageId || null,
      difficulty: defaultValues.difficulty,
      type: defaultValues.type,
      requiredTier: defaultValues.requiredTier || "free",
      educationGradeId: defaultValues.educationGradeId ?? "",
      isActive: defaultValues.isActive ?? true,
    },
  });

  const onFormSubmit = (values: any) => {
    // Convert empty string/null for educationGradeId and passageId
    const payload = {
      ...values,
      educationGradeId:
        values.educationGradeId === "" || values.educationGradeId === null
          ? null
          : Number(values.educationGradeId),
      passageId:
        values.passageId === "" || values.passageId === "null" || values.passageId === null
          ? null
          : values.passageId,
    };
    onSubmit(payload);
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
    { label: t(($) => $.exam.questions.form.type.options.essay), value: EnumQuestionType.ESSAY },
  ];

  const formConfig = {
    subjectId: {
      type: "combobox",
      name: "subjectId",
      label: t(($) => $.exam.questions.form.subject.label),
      placeholder: t(($) => $.exam.questions.form.subject.placeholder),
      options: subjectOptions,
      disabled: isFetchingSubjects,
      isLoading: isFetchingSubjects,
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
  };

  return (
    <Form {...form}>
      <FormWithDetector
        form={form}
        onSubmit={onFormSubmit}
        schema={formSchema}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="space-y-6">
            <ControlForm form={form} item={formConfig.subjectId} />
            <ControlForm form={form} item={formConfig.passageId} />
            <ControlForm form={form} item={formConfig.isActive} />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ControlForm form={form} item={formConfig.difficulty} />
              <ControlForm form={form} item={formConfig.type} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ControlForm form={form} item={formConfig.requiredTier} />
              <ControlForm form={form} item={formConfig.educationGradeId} />
            </div>
          </div>
        </div>

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
