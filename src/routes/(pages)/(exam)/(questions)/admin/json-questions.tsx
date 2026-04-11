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
import { ChevronDown, AlertCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCreateQuestion } from "@/api/exam-questions";
import { useCreateQuestionOption } from "@/api/exam-question-options";
import { useCreateQuestionSolution } from "@/api/exam-question-solutions";
import { useAssignQuestionTagByName } from "@/api/exam-question-tags";
import { useListTagSimple } from "@/api/education-tags";
import { showNotifSuccess } from "@/lib/show-notif";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnumDifficultyLevel, EnumQuestionType } from "@/api/exam-questions/types";
import {
  GlobalParamsForm,
  PackageParamsForm,
  PasteJsonDialog,
  QuestionNumberGrid,
  JsonQuestionEditView,
} from "@/components/pages/exam/questions/json-questions";
import { useAssignPackageQuestions } from "@/api/exam-package-questions";
import { JsonQuestionImport } from "@/api/exam-questions/types";
import { VALID_BLOCK_TYPES } from "@/components/custom/components/block-note/lib/blocknote-config";

const jsonQuestionsSearchSchema = z.object({
  index: z.coerce.number().default(0).catch(0),
  expanded: z.coerce.boolean().default(true).catch(true),
  contentExpanded: z.coerce.boolean().default(true).catch(true),
  optionsExpanded: z.coerce.boolean().default(true).catch(true),
  solutionsExpanded: z.coerce.boolean().default(true).catch(true),
  tagsExpanded: z.coerce.boolean().default(true).catch(true),
  packageExpanded: z.coerce.boolean().default(true).catch(true),
  variablesExpanded: z.coerce.boolean().default(true).catch(true),
  reasonExpanded: z.coerce.boolean().default(true).catch(true),
  previewExpanded: z.coerce.boolean().default(true).catch(true),
  tab: z.string().default("edit").catch("edit"),
});

export const Route = createFileRoute("/(pages)/(exam)/(questions)/admin/json-questions")({
  validateSearch: (search) => jsonQuestionsSearchSchema.parse(search),
  component: JsonQuestionsPage,
});

function JsonQuestionsPage() {
  const { t } = useAppTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    index: selectedIndex,
    expanded: isExpanded,
    contentExpanded,
    optionsExpanded,
    solutionsExpanded,
    tagsExpanded,
    packageExpanded,
    variablesExpanded,
    reasonExpanded,
    previewExpanded,
    tab,
  } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const setSelectedIndex = (index: number) => {
    navigate({ search: (prev: any) => ({ ...prev, index }), replace: true });
  };

  const setIsExpanded = (expanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, expanded }), replace: true });
  };

  const setContentExpanded = (contentExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, contentExpanded }), replace: true });
  };

  const setOptionsExpanded = (optionsExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, optionsExpanded }), replace: true });
  };

  const setSolutionsExpanded = (solutionsExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, solutionsExpanded }), replace: true });
  };

  const setTagsExpanded = (tagsExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, tagsExpanded }), replace: true });
  };
  const setVariablesExpanded = (variablesExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, variablesExpanded }), replace: true });
  };
  const setReasonExpanded = (reasonExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, reasonExpanded }), replace: true });
  };
  const setPreviewExpanded = (previewExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, previewExpanded }), replace: true });
  };
  const setTab = (tab: string) => {
    navigate({ search: (prev: any) => ({ ...prev, tab }), replace: true });
  };

  /**
   * Recursively validates that all blocks in a BlockNote content array have valid types.
   * Also repairs missing required props to prevent BlockNote from crashing.
   */
  const validateAndRepairBlockNoteContent = (
    blocks: any[],
  ): { isValid: boolean; errorPath?: string } => {
    if (!Array.isArray(blocks)) return { isValid: true };

    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];
      if (typeof block !== "object" || block === null) continue;

      // Automatically repair common AI error: raw inline "text" object used as a block
      if (block.type === "text") {
        block = {
          type: "paragraph",
          props: {},
          content: [block],
          children: [],
        };
        blocks[i] = block;
      }

      // Check the block type
      if (block.type && !VALID_BLOCK_TYPES.includes(block.type as any)) {
        return { isValid: false, errorPath: `type: "${block.type}"` };
      }

      // Automatically repair missing properties to prevent BlockNote crashes
      if (!block.props) block.props = {};

      if (block.type === "math") {
        if (!block.props.textAlignment) block.props.textAlignment = "left";
        if (!block.props.textColor) block.props.textColor = "default";
        if (block.props.fontSize === undefined) block.props.fontSize = 18;
      } else if (block.type === "alert") {
        if (!block.props.type) block.props.type = "info";
      }

      // Recursively check children
      if (block.children && Array.isArray(block.children)) {
        const result = validateAndRepairBlockNoteContent(block.children);
        if (!result.isValid) {
          return {
            isValid: false,
            errorPath: `${block.type} > ${result.errorPath}`,
          };
        }
      }
    }

    return { isValid: true };
  };

  const queryClient = useQueryClient();
  const createQuestionMutation = useCreateQuestion();
  const createOptionMutation = useCreateQuestionOption();
  const createSolutionMutation = useCreateQuestionSolution();
  const assignTagByNameMutation = useAssignQuestionTagByName();
  const assignPackageQuestionMutation = useAssignPackageQuestions();
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

  const packageFormSchema = z.object({
    packageId: z.string().uuid().nullish(),
    sectionId: z.string().uuid().nullish(),
  });

  const jsonQuestions = useAppStore((state) => state.jsonQuestions);
  const setJsonQuestions = useAppStore((state) => state.setJsonQuestions);
  const setJsonQuestionsGlobalParams = useAppStore((state) => state.setJsonQuestionsGlobalParams);
  const jsonQuestionsPackageParams = useAppStore((state) => state.jsonQuestionsPackageParams);
  const setJsonQuestionsPackageParams = useAppStore((state) => state.setJsonQuestionsPackageParams);

  const globalForm = useForm<z.infer<typeof globalFormSchema>>({
    resolver: zodResolver(globalFormSchema),
    defaultValues: useAppStore.getState().jsonQuestionsGlobalParams,
  });

  const packageForm = useForm<z.infer<typeof packageFormSchema>>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: jsonQuestionsPackageParams,
  });

  // Watch for changes and sync to store without re-rendering local component reactively
  React.useEffect(() => {
    const subscription = globalForm.watch((values) => {
      setJsonQuestionsGlobalParams(values);
    });
    return () => subscription.unsubscribe();
  }, [globalForm, setJsonQuestionsGlobalParams]);

  React.useEffect(() => {
    const subscription = packageForm.watch((values) => {
      setJsonQuestionsPackageParams(values);
    });
    return () => subscription.unsubscribe();
  }, [packageForm, setJsonQuestionsPackageParams]);

  const processJsonContent = (content: string) => {
    setImportError(null);
    try {
      const parsed = JSON.parse(content);
      const rawArray = Array.isArray(parsed)
        ? parsed
        : Object.keys(parsed).length > 0
          ? [parsed]
          : [];

      if (rawArray.length > 0) {
        const processed: JsonQuestionImport[] = rawArray.map((q: any, index: number) => {
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

        // RE-VALIDATE BLOCKNOTE CONTENT TYPES
        // This is crucial to prevent crashes in the editor view
        for (let i = 0; i < processed.length; i++) {
          const q = processed[i];
          const questionNum = i + 1;

          // Validate and repair main content
          const mainContentVal = validateAndRepairBlockNoteContent(q.content);
          if (!mainContentVal.isValid) {
            const msg = `Question #${questionNum}: Invalid BlockNote block ${mainContentVal.errorPath}`;
            setImportError(msg);
            showNotifError({ message: msg });
            return false;
          }

          // Validate and repair reason content (for statement_reasoning)
          if (q.reasonContent) {
            const reasonContentVal = validateAndRepairBlockNoteContent(q.reasonContent);
            if (!reasonContentVal.isValid) {
              const msg = `Question #${questionNum} (Reason): Invalid BlockNote block ${reasonContentVal.errorPath}`;
              setImportError(msg);
              showNotifError({ message: msg });
              return false;
            }
          }

          // Validate and repair options
          if (q.options) {
            for (let j = 0; j < q.options.length; j++) {
              const opt = q.options[j];
              const optVal = validateAndRepairBlockNoteContent(opt.content as any[]);
              if (!optVal.isValid) {
                const msg = `Question #${questionNum}, Option #${j + 1}: Invalid BlockNote block ${optVal.errorPath}`;
                setImportError(msg);
                showNotifError({ message: msg });
                return false;
              }
            }
          }

          // Validate and repair solutions
          if (q.solutions) {
            for (let j = 0; j < q.solutions.length; j++) {
              const sol = q.solutions[j];
              const solVal = validateAndRepairBlockNoteContent(sol.content as any[]);
              if (!solVal.isValid) {
                const msg = `Question #${questionNum}, Solution #${j + 1}: Invalid BlockNote block ${solVal.errorPath}`;
                setImportError(msg);
                showNotifError({ message: msg });
                return false;
              }
            }
          }
        }

        setJsonQuestions(processed);
        setSelectedIndex(0);
        return true;
      } else {
        const msg = t(($) => $.exam.questions.jsonQuestions.invalidFormat);
        setImportError(msg);
        showNotifError({ message: msg });
        return false;
      }
    } catch (err) {
      const msg = t(($) => $.exam.questions.jsonQuestions.parseError);
      setImportError(msg);
      showNotifError({ message: msg });
      return false;
    }
  };

  const handleImportClick = () => {
    setImportError(null);
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
  const setPackageExpanded = (expanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, packageExpanded: expanded }) });
  };

  const onPasteSubmit = (json: string) => {
    setIsPasteModalOpen(false);
    processJsonContent(json);
  };

  const handleUpdateQuestion = (updatedQuestion: JsonQuestionImport) => {
    const newJsonQuestions = [...jsonQuestions];
    newJsonQuestions[selectedIndex] = updatedQuestion;
    setJsonQuestions(newJsonQuestions);
  };

  const clearQuestions = () => {
    setJsonQuestions([]);
    setSelectedIndex(0);
    setSelectedIndices([]);
    setImportError(null);
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

    const globalParams = globalForm.getValues();
    const packageParams = packageForm.getValues();

    if (packageParams.packageId && !packageParams.sectionId) {
      showNotifError({ message: t(($) => $.exam.questions.form.section.required) });
      return;
    }

    setIsExporting(true);
    const exportedQuestionIds: string[] = [];

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
        const transformedData = {
          ...q,
          subjectId: globalParams.subjectId,
          difficulty: globalParams.difficulty,
          type: globalParams.type,
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
        // Keep track of which one to remove
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
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() =>
                    navigate({ to: AppRoute.exam.questions.admin.promptGenerator.url })
                  }
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  {t(($) => $.exam.questions.jsonQuestions.promptGeneratorButton)}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={handleImportClick}>
                  <Upload className="h-4 w-4" />
                  {t(($) => $.exam.questions.jsonQuestions.importButton)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => {
                    setImportError(null);
                    setIsPasteModalOpen(true);
                  }}
                >
                  <ClipboardPaste className="h-4 w-4" />
                  {t(($) => $.exam.questions.jsonQuestions.pasteButton)}
                </DropdownMenuItem>
                {jsonQuestions.length > 0 && (
                  <>
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

      {importError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t(($) => $.labels.error)}</AlertTitle>
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      {jsonQuestions.length > 0 ? (
        <div className="flex flex-col gap-6">
          <GlobalParamsForm form={globalForm} isOpen={isExpanded} onOpenChange={setIsExpanded} />

          <PackageParamsForm
            form={packageForm}
            isOpen={packageExpanded}
            onOpenChange={setPackageExpanded}
          />

          <QuestionNumberGrid
            jsonQuestions={jsonQuestions}
            selectedIndex={selectedIndex}
            selectedIndices={selectedIndices}
            onSelect={setSelectedIndex}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onExport={handleExportSelected}
            isExporting={isExporting}
            canExport={!!globalForm.watch("subjectId")}
          />

          {/* Main Content Area */}
          {currentQuestion ? (
            <JsonQuestionEditView
              key={currentQuestion.id || `temp-${selectedIndex}`}
              question={{ ...currentQuestion, id: currentQuestion.id || `temp-${selectedIndex}` }}
              onUpdate={handleUpdateQuestion}
              availableTags={tagsData?.data?.items?.map((t) => t.label) || []}
              contentExpanded={contentExpanded}
              onToggleContent={setContentExpanded}
              optionsExpanded={optionsExpanded}
              onToggleOptions={setOptionsExpanded}
              solutionsExpanded={solutionsExpanded}
              onToggleSolutions={setSolutionsExpanded}
              tagsExpanded={tagsExpanded}
              onToggleTags={setTagsExpanded}
              variablesExpanded={variablesExpanded}
              onToggleVariables={setVariablesExpanded}
              reasonExpanded={reasonExpanded}
              onToggleReason={setReasonExpanded}
              previewExpanded={previewExpanded}
              onTogglePreview={setPreviewExpanded}
              tab={tab}
              onTabChange={setTab}
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
