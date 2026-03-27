import React, { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/app";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { Upload, Trash2, ClipboardPaste } from "lucide-react";
import { AppRoute } from "@/constants/app-route";
import { showNotifError } from "@/lib/show-notif";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Save } from "lucide-react";
import { useCreateQuestion } from "@/api/exam-questions";
import { useCreateQuestionOption } from "@/api/exam-question-options";
import { useCreateQuestionSolution } from "@/api/exam-question-solutions";
import { useAssignQuestionTag } from "@/api/exam-question-tags";
import { useListTagSimple } from "@/api/education-tags";
import { showNotifSuccess } from "@/lib/show-notif";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnumDifficultyLevel, EnumQuestionType } from "@/api/exam-questions/types";
import {
  GlobalParamsForm,
  PasteJsonDialog,
  QuestionNumberGrid,
  JsonQuestionEditView,
} from "@/components/pages/exam/questions/json-questions";

export const Route = createFileRoute("/(pages)/(exam)/(questions)/admin/json-questions")({
  component: JsonQuestionsPage,
});

function JsonQuestionsPage() {
  const { t } = useAppTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const queryClient = useQueryClient();
  const createQuestionMutation = useCreateQuestion();
  const createOptionMutation = useCreateQuestionOption();
  const createSolutionMutation = useCreateQuestionSolution();
  const assignTagMutation = useAssignQuestionTag();
  const { data: tagsData } = useListTagSimple({ limit: 1000 });

  const globalFormSchema = z.object({
    subjectId: z.string().min(
      1,
      t(($) => $.exam.questions.form.subject.required),
    ),
    passageId: z.string().nullable().optional(),
    difficulty: z.enum(Object.values(EnumDifficultyLevel) as [string, ...string[]]),
    type: z.enum(Object.values(EnumQuestionType) as [string, ...string[]]),
    requiredTier: z.string().nullable().optional(),
    educationGradeId: z.union([z.number(), z.string(), z.null()]).optional(),
  });

  const globalForm = useForm<z.infer<typeof globalFormSchema>>({
    resolver: zodResolver(globalFormSchema),
    defaultValues: {
      subjectId: "",
      passageId: null,
      difficulty: EnumDifficultyLevel.MEDIUM,
      type: EnumQuestionType.MULTIPLE_CHOICE,
      requiredTier: "free",
      educationGradeId: "",
    },
  });

  const jsonQuestions = useAppStore((state) => state.jsonQuestions);
  const setJsonQuestions = useAppStore((state) => state.setJsonQuestions);

  const processJsonContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      const rawArray = Array.isArray(parsed)
        ? parsed
        : Object.keys(parsed).length > 0
          ? [parsed]
          : [];

      if (rawArray.length > 0) {
        const processed = rawArray.map((q, index) => {
          const rawData = q;
          return {
            ...rawData,
            id: rawData.id || `temp-${index}`,
            options: (rawData.options || []).map((opt: any, optIndex: number) => ({
              ...opt,
              id: opt.id || `temp-opt-${index}-${optIndex}`,
            })),
            solutions: (rawData.solutions || []).map((sol: any, solIndex: number) => ({
              ...sol,
              id: sol.id || `temp-sol-${index}-${solIndex}`,
            })),
          };
        });

        setJsonQuestions(processed);
        setSelectedIndex(0);
        return true;
      } else {
        showNotifError({ message: t(($) => $.exam.questions.jsonQuestions.invalidFormat) });
        return false;
      }
    } catch (err) {
      console.error("Error parsing JSON:", err);
      showNotifError({ message: t(($) => $.exam.questions.jsonQuestions.parseError) });
      return false;
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      processJsonContent(content);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onPasteSubmit = (json: string) => {
    const success = processJsonContent(json);
    if (success) {
      setIsPasteModalOpen(false);
    }
  };

  const handleUpdateQuestion = (updatedQuestion: any) => {
    const newJsonQuestions = [...jsonQuestions];
    newJsonQuestions[selectedIndex] = updatedQuestion;
    setJsonQuestions(newJsonQuestions);
  };

  const clearQuestions = () => {
    setJsonQuestions([]);
    setSelectedIndex(0);
    setSelectedIndices([]);
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === jsonQuestions.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(jsonQuestions.map((_, i) => i));
    }
  };

  const handleExportSelected = async () => {
    const isValid = await globalForm.trigger();
    if (!isValid || selectedIndices.length === 0) return;

    setIsExporting(true);
    const globalParams = globalForm.getValues();

    // Prepare tag mapping
    const tagMap =
      tagsData?.data?.items.reduce(
        (acc, tag) => {
          acc[tag.label.toLowerCase()] = tag.value;
          return acc;
        },
        {} as Record<string, string>,
      ) || {};

    let successCount = 0;
    const remainingIndices: number[] = [...selectedIndices];

    try {
      for (const index of selectedIndices) {
        const q = jsonQuestions[index];

        // 1. Create Question (Global values as overrides)
        const qRes = await createQuestionMutation.mutateAsync({
          subjectId: globalParams.subjectId,
          passageId: globalParams.passageId || q.passageId,
          content: q.content,
          difficulty: globalParams.difficulty,
          type: globalParams.type,
          requiredTier: globalParams.requiredTier,
          educationGradeId: globalParams.educationGradeId
            ? Number(globalParams.educationGradeId)
            : q.educationGradeId
              ? Number(q.educationGradeId)
              : undefined,
          isActive: q.isActive ?? true,
          variableFormulas: q.variableFormulas,
        } as any);

        const newQuestionId = qRes.data.id;

        // 2. Create Options
        if (q.options?.length) {
          for (const opt of q.options) {
            await createOptionMutation.mutateAsync({
              questionId: newQuestionId,
              content: opt.content,
              isCorrect: opt.isCorrect,
              order: opt.order,
            } as any);
          }
        }

        // 3. Create Solutions
        if (q.solutions?.length) {
          for (const sol of q.solutions) {
            await createSolutionMutation.mutateAsync({
              questionId: newQuestionId,
              title: sol.title,
              content: sol.content,
              solutionType: sol.solutionType,
              order: sol.order,
              requiredTier: sol.requiredTier,
            } as any);
          }
        }

        // 4. Assign Tags
        if (q.tags?.length) {
          const tagIds = q.tags
            .map((tagName: string) => tagMap[tagName.toLowerCase()])
            .filter(Boolean);

          if (tagIds.length > 0) {
            await assignTagMutation.mutateAsync({
              questionId: newQuestionId,
              tagIds: tagIds,
            });
          }
        }

        successCount++;
        // Keep track of which one to remove
        remainingIndices.splice(remainingIndices.indexOf(index), 1);
      }

      showNotifSuccess({
        message: t(($) => $.exam.questions.jsonQuestions.exportSuccess).replace(
          "{count}",
          successCount.toString(),
        ),
      });

      // Update local store: remove successfully exported questions
      const newJsonQuestions = jsonQuestions.filter((_, i) => !selectedIndices.includes(i));
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
      const exportedIndices = selectedIndices.filter((i) => !remainingIndices.includes(i));
      const newJsonQuestions = jsonQuestions.filter((_, i) => !exportedIndices.includes(i));
      setJsonQuestions(newJsonQuestions);
      setSelectedIndices([]);
      setSelectedIndex(0);
    } finally {
      setIsExporting(false);
    }
  };

  const currentQuestion = jsonQuestions[selectedIndex];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <PageTitle
        title={t(($) => $.exam.questions.jsonQuestions.title)}
        description={t(($) => $.exam.questions.jsonQuestions.description)}
        showBack
        backTo={AppRoute.exam.questions.admin.list.url}
        extra={
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                  {t(($) => $.labels.actions)}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem className="gap-2" onClick={handleImportClick}>
                  <Upload className="h-4 w-4" />
                  {t(($) => $.exam.questions.jsonQuestions.importButton)}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => setIsPasteModalOpen(true)}>
                  <ClipboardPaste className="h-4 w-4" />
                  {t(($) => $.exam.questions.jsonQuestions.pasteButton)}
                </DropdownMenuItem>
                {jsonQuestions.length > 0 && (
                  <>
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={handleExportSelected}
                      disabled={selectedIndices.length === 0 || isExporting}
                    >
                      <Save className="h-4 w-4" />
                      {isExporting
                        ? t(($) => $.exam.questions.jsonQuestions.exporting)
                        : t(($) => $.exam.questions.jsonQuestions.exportSelected)}{" "}
                      ({selectedIndices.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      className="gap-2"
                      onClick={clearQuestions}
                      disabled={isExporting}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t(($) => $.exam.questions.jsonQuestions.clearButton)}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {jsonQuestions.length > 0 ? (
        <div className="flex flex-col gap-6">
          <GlobalParamsForm form={globalForm} />

          <QuestionNumberGrid
            jsonQuestions={jsonQuestions}
            selectedIndex={selectedIndex}
            selectedIndices={selectedIndices}
            onSelect={setSelectedIndex}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />

          {/* Main Content Area */}
          {currentQuestion ? (
            <JsonQuestionEditView
              key={currentQuestion.id || `temp-${selectedIndex}`}
              question={{ ...currentQuestion, id: currentQuestion.id || `temp-${selectedIndex}` }}
              onUpdate={handleUpdateQuestion}
            />
          ) : (
            <div className="flex items-center justify-center p-12 border rounded-lg bg-card text-muted-foreground">
              {t(($) => $.exam.questions.jsonQuestions.selectQuestion)}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-muted-foreground">
          <Upload className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p className="mb-2">{t(($) => $.exam.questions.jsonQuestions.noJsonImported)}</p>
          <p className="text-sm">{t(($) => $.exam.questions.jsonQuestions.noJsonImportedDesc)}</p>
        </div>
      )}

      <PasteJsonDialog
        open={isPasteModalOpen}
        onOpenChange={setIsPasteModalOpen}
        onSubmit={onPasteSubmit}
      />
    </div>
  );
}
