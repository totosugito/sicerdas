import React from "react";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ChevronDown, Settings2 } from "lucide-react";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useListSubjectSimple } from "@/api/exam/subjects";
import { useListPassageSimple } from "@/api/exam/passages";
import { useListTier } from "@/api/tier";
import { useListGradeSimple } from "@/api/education/grades";
import { EnumDifficultyLevel, EnumQuestionType } from "@/api/exam/questions/types";

interface GlobalParamsFormProps {
  form: any;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalParamsForm({ form, isOpen = true, onOpenChange }: GlobalParamsFormProps) {
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
      label: t(($) => $.exam.questions.form.type.options.statement_reasoning),
      value: EnumQuestionType.STATEMENT_REASONING,
    },
  ];

  const config = {
    subjectId: {
      type: "combobox" as const,
      name: "subjectId",
      label: t(($) => $.exam.questions.form.subject.label),
      placeholder: t(($) => $.exam.questions.form.subject.placeholder),
      options: subjectOptions,
      disabled: isFetchingSubjects,
      isLoading: isFetchingSubjects,
    },
    passageId: {
      type: "combobox" as const,
      name: "passageId",
      label: t(($) => $.exam.questions.form.passage.label),
      placeholder: t(($) => $.exam.questions.form.passage.placeholder),
      options: passageOptions,
      disabled: isFetchingPassages,
      isLoading: isFetchingPassages,
    },
    difficulty: {
      type: "select" as const,
      name: "difficulty",
      label: t(($) => $.exam.questions.form.difficulty.label),
      placeholder: t(($) => $.exam.questions.form.difficulty.placeholder),
      options: difficultyOptions,
    },
    type: {
      type: "select" as const,
      name: "type",
      label: t(($) => $.exam.questions.form.type.label),
      placeholder: t(($) => $.exam.questions.form.type.placeholder),
      options: typeOptions,
    },
    requiredTier: {
      type: "select" as const,
      name: "requiredTier",
      label: t(($) => $.exam.questions.form.requiredTier.label),
      placeholder: t(($) => $.exam.questions.form.requiredTier.placeholder),
      options: tierOptions,
      disabled: isLoadingTier,
    },
    educationGradeId: {
      type: "combobox" as const,
      name: "educationGradeId",
      label: t(($) => $.exam.questions.form.educationGrade.label),
      placeholder: t(($) => $.exam.questions.form.educationGrade.placeholder),
      options: gradeOptions,
      disabled: isFetchingGrades,
      isLoading: isFetchingGrades,
    },
  };

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b w-full text-left outline-none"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  {t(($) => $.exam.questions.jsonQuestions.globalParameters.title)}
                </h3>
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
            </button>
          }
        />
        <CollapsibleContent className="p-6">
          <form.AppForm>
            <FormWithDetector
              form={form}
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <form.AppField name="subjectId">
                  {(field: any) => <ControlForm field={field} item={config.subjectId} showMessage={true} />}
                </form.AppField>
                <form.AppField name="passageId">
                  {(field: any) => <ControlForm field={field} item={config.passageId} showMessage={true} />}
                </form.AppField>
                <form.AppField name="difficulty">
                  {(field: any) => <ControlForm field={field} item={config.difficulty} showMessage={true} />}
                </form.AppField>
                <form.AppField name="type">
                  {(field: any) => <ControlForm field={field} item={config.type} showMessage={true} />}
                </form.AppField>
                <form.AppField name="requiredTier">
                  {(field: any) => <ControlForm field={field} item={config.requiredTier} showMessage={true} />}
                </form.AppField>
                <form.AppField name="educationGradeId">
                  {(field: any) => <ControlForm field={field} item={config.educationGradeId} showMessage={true} />}
                </form.AppField>
              </div>
            </FormWithDetector>
          </form.AppForm>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
            <p>{t(($) => $.exam.questions.jsonQuestions.globalParameters.overrideNote)}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
