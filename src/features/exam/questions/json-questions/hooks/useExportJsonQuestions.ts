import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppTranslation } from "@/lib/i18n-typed";
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";
import { useCreateQuestion } from "@/api/exam/questions";
import { useCreateQuestionOption } from "@/api/exam/question-options";
import { useCreateQuestionSolution } from "@/api/exam/question-solutions";
import { useAssignQuestionTagByName } from "@/api/exam/question-tags";
import { useAssignPackageQuestions } from "@/api/exam/package-questions";
import { JsonQuestionImport } from "@/api/exam/questions/types";

interface UseExportJsonQuestionsProps {
  globalForm: any;
  packageForm: any;
  jsonQuestions: JsonQuestionImport[];
  setJsonQuestions: (questions: JsonQuestionImport[]) => void;
  selectedIndices: number[];
  setSelectedIndices: (indices: number[]) => void;
  setSelectedIndex: (index: number) => void;
  tagsData?: { data?: { items: Array<{ label: string; value: string }> } };
}

export function useExportJsonQuestions({
  globalForm,
  packageForm,
  jsonQuestions,
  setJsonQuestions,
  selectedIndices,
  setSelectedIndices,
  setSelectedIndex,
  tagsData,
}: UseExportJsonQuestionsProps) {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  const createQuestionMutation = useCreateQuestion();
  const createOptionMutation = useCreateQuestionOption();
  const createSolutionMutation = useCreateQuestionSolution();
  const assignTagByNameMutation = useAssignQuestionTagByName();
  const assignPackageQuestionMutation = useAssignPackageQuestions();

  const handleExportSelected = async () => {
    await globalForm.validate("submit");
    const isValid = globalForm.state.isValid;

    const targetIndices =
      selectedIndices.length > 0
        ? selectedIndices
        : jsonQuestions.map((_, i) => i);

    if (!isValid || targetIndices.length === 0) return;

    const globalParams = globalForm.state.values;
    const packageParams = packageForm.state.values;

    if (packageParams.packageId && !packageParams.sectionId) {
      showNotifError({ message: t(($) => $.exam.questions.form.section.required) });
      return;
    }

    setIsExporting(true);
    const exportedQuestionIds: string[] = [];

    let successCount = 0;
    const remainingIndices: number[] = [...targetIndices];

    try {
      for (const index of targetIndices) {
        const q = jsonQuestions[index];

        // 1. Create Question (Global values as overrides)
        const transformedData = {
          ...q,
          subjectId: globalParams.subjectId || (q as any).subjectId,
          difficulty: globalParams.difficulty || q.difficulty,
          type: globalParams.type || q.type,
          educationGradeId: (() => {
            const val = globalParams.educationGradeId || q.educationGradeId;
            if (val === undefined || val === null || val === "") return null;
            const num = Number(val);
            return isNaN(num) ? null : num;
          })(),
          requiredTier: globalParams.requiredTier || q.requiredTier || null,
          passageId: globalParams.passageId || q.passageId || null,
          maxScore: q.maxScore !== undefined && q.maxScore !== null ? Number(q.maxScore) : 1,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(transformedData));

        const qRes = await createQuestionMutation.mutateAsync(formData);
        const newQuestionId = qRes.data.id;

        // 2. Create Options
        if (q.options?.length) {
          for (const opt of q.options) {
            const optPayload = {
              questionId: newQuestionId,
              content: opt.content,
              isCorrect: opt.isCorrect,
              order: opt.order,
            };
            const optFormData = new FormData();
            optFormData.append("data", JSON.stringify(optPayload));
            await createOptionMutation.mutateAsync(optFormData as any);
          }
        }

        // 3. Create Solutions
        if (q.solutions?.length) {
          for (const sol of q.solutions) {
            const solPayload = {
              questionId: newQuestionId,
              title: sol.title,
              content: sol.content,
              solutionType: sol.solutionType,
              order: sol.order,
              requiredTier: sol.requiredTier,
            };
            const solFormData = new FormData();
            solFormData.append("data", JSON.stringify(solPayload));
            await createSolutionMutation.mutateAsync(solFormData as any);
          }
        }

        // 4. Assign Tags
        if (q.tags?.length) {
          await assignTagByNameMutation.mutateAsync({
            questionId: newQuestionId,
            tags: q.tags,
          });
        }

        exportedQuestionIds.push(newQuestionId);
        successCount++;
        remainingIndices.splice(remainingIndices.indexOf(index), 1);
      }

      // 5. Assign to Package if selected
      if (packageParams.packageId && packageParams.sectionId && exportedQuestionIds.length > 0) {
        await assignPackageQuestionMutation.mutateAsync({
          packageId: packageParams.packageId,
          sectionId: packageParams.sectionId,
          questionIds: exportedQuestionIds,
        });
      }

      showNotifSuccess({
        message: t(($) => $.exam.questions.jsonQuestions.exportSuccess).replace(
          "{count}",
          successCount.toString(),
        ),
      });

      // Update local store: remove successfully exported questions
      const newJsonQuestions = jsonQuestions.filter((_, i) => !targetIndices.includes(i));
      setJsonQuestions(newJsonQuestions);
      setSelectedIndices([]);
      setSelectedIndex(0);
      queryClient.invalidateQueries({ queryKey: ["admin-exam-questions-list"] });
    } catch (err: any) {
      showNotifError({
        message: t(($) => $.exam.questions.jsonQuestions.exportError).replace(
          "{error}",
          err.message || "Unknown error",
        ),
      });

      // Still remove whichever were successful before error
      const exportedIndices = targetIndices.filter((i) => !remainingIndices.includes(i));
      const newJsonQuestions = jsonQuestions.filter((_, i) => !exportedIndices.includes(i));
      setJsonQuestions(newJsonQuestions);
      setSelectedIndices([]);
      setSelectedIndex(0);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExportSelected,
  };
}
