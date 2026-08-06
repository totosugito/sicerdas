import React, { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/general";
import { useAppStore } from "@/stores/useAppStore";
import { AppRoute } from "@/constants/app-route";
import { showNotifError } from "@/lib/show-notif";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useListTagSimple } from "@/api/education/tags";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { EnumDifficultyLevel, EnumQuestionType } from "@/api/exam/questions/types";
import {
  GlobalParamsForm,
  PackageParamsForm,
  PasteJsonDialog,
  QuestionNumberGrid,
  JsonQuestionEditView,
  JsonQuestionsHeaderActions,
  JsonQuestionsEmptyState,
  validateAndRepairBlockNoteContent,
  useExportJsonQuestions,
} from "@/features/exam/questions/json-questions";
import { JsonQuestionImport } from "@/api/exam/questions/types";

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

export const Route = createFileRoute("/(pages)/exam/(questions)/admin/json-questions")({
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
  const [importError, setImportError] = useState<string | null>(null);

  const setSelectedIndex = (index: number) => {
    navigate({ search: (prev: any) => ({ ...prev, index }), replace: true, resetScroll: false });
  };
  const setIsExpanded = (expanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, expanded }), replace: true, resetScroll: false });
  };
  const setContentExpanded = (contentExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, contentExpanded }), replace: true, resetScroll: false });
  };
  const setOptionsExpanded = (optionsExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, optionsExpanded }), replace: true, resetScroll: false });
  };
  const setSolutionsExpanded = (solutionsExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, solutionsExpanded }), replace: true, resetScroll: false });
  };
  const setTagsExpanded = (tagsExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, tagsExpanded }), replace: true, resetScroll: false });
  };
  const setVariablesExpanded = (variablesExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, variablesExpanded }), replace: true, resetScroll: false });
  };
  const setReasonExpanded = (reasonExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, reasonExpanded }), replace: true, resetScroll: false });
  };
  const setPreviewExpanded = (previewExpanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, previewExpanded }), replace: true, resetScroll: false });
  };
  const setTab = (tab: string) => {
    navigate({ search: (prev: any) => ({ ...prev, tab }), replace: true, resetScroll: false });
  };
  const setPackageExpanded = (expanded: boolean) => {
    navigate({ search: (prev: any) => ({ ...prev, packageExpanded: expanded }) });
  };

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

  const globalForm = useAppForm({
    defaultValues: useAppStore.getState().jsonQuestionsGlobalParams,
    validators: {
      onChange: globalFormSchema as any,
    },
  });

  const packageForm = useAppForm({
    defaultValues: jsonQuestionsPackageParams,
    validators: {
      onChange: packageFormSchema as any,
    },
  });

  React.useEffect(() => {
    const sub = globalForm.store.subscribe(() => {
      setJsonQuestionsGlobalParams(globalForm.state.values);
    });
    return () => {
      if (typeof sub === "function") {
        (sub as any)();
      } else if (sub && typeof (sub as any).unsubscribe === "function") {
        (sub as any).unsubscribe();
      }
    };
  }, [globalForm, setJsonQuestionsGlobalParams]);

  React.useEffect(() => {
    const sub = packageForm.store.subscribe(() => {
      setJsonQuestionsPackageParams(packageForm.state.values);
    });
    return () => {
      if (typeof sub === "function") {
        (sub as any)();
      } else if (sub && typeof (sub as any).unsubscribe === "function") {
        (sub as any).unsubscribe();
      }
    };
  }, [packageForm, setJsonQuestionsPackageParams]);

  const { isExporting, handleExportSelected } = useExportJsonQuestions({
    globalForm,
    packageForm,
    jsonQuestions,
    setJsonQuestions,
    selectedIndices,
    setSelectedIndices,
    setSelectedIndex,
    tagsData,
  });

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
        for (let i = 0; i < processed.length; i++) {
          const q = processed[i];
          const questionNum = i + 1;

          const mainContentVal = validateAndRepairBlockNoteContent(q.content);
          if (!mainContentVal.isValid) {
            const msg = `Question #${questionNum}: Invalid BlockNote block ${mainContentVal.errorPath}`;
            setImportError(msg);
            showNotifError({ message: msg });
            return false;
          }

          if (q.reasonContent) {
            const reasonContentVal = validateAndRepairBlockNoteContent(q.reasonContent);
            if (!reasonContentVal.isValid) {
              const msg = `Question #${questionNum} (Reason): Invalid BlockNote block ${reasonContentVal.errorPath}`;
              setImportError(msg);
              showNotifError({ message: msg });
              return false;
            }
          }

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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const currentQuestion = jsonQuestions[selectedIndex];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <PageTitle
        title={t(($) => $.exam.questions.jsonQuestions.title)}
        description={t(($) => $.exam.questions.jsonQuestions.description)}
        showBack
        backTo={AppRoute.exam.questions.admin.list.url}
        extra={
          <JsonQuestionsHeaderActions
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            onImportClick={handleImportClick}
            onOpenPasteModal={() => {
              setImportError(null);
              setIsPasteModalOpen(true);
            }}
            onClearQuestions={clearQuestions}
            hasQuestions={jsonQuestions.length > 0}
            isExporting={isExporting}
            onNavigatePromptGenerator={() =>
              navigate({ to: AppRoute.exam.questions.admin.promptGenerator.url })
            }
          />
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

          <globalForm.Subscribe selector={(state: any) => state.values.subjectId}>
            {(subjectId: any) => (
              <QuestionNumberGrid
                jsonQuestions={jsonQuestions}
                selectedIndex={selectedIndex}
                selectedIndices={selectedIndices}
                onSelect={setSelectedIndex}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                onExport={handleExportSelected}
                isExporting={isExporting}
                canExport={!!subjectId}
              />
            )}
          </globalForm.Subscribe>

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
        <JsonQuestionsEmptyState
          onImportClick={handleImportClick}
          onOpenPasteModal={() => {
            setImportError(null);
            setIsPasteModalOpen(true);
          }}
        />
      )}

      <PasteJsonDialog
        open={isPasteModalOpen}
        onOpenChange={setIsPasteModalOpen}
        onSubmit={onPasteSubmit}
      />
    </div>
  );
}
