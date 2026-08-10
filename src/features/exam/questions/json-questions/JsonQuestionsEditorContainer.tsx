import React, { useRef, useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/general";
import { useAppStore } from "@/stores/useAppStore";
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

export interface JsonQuestionsEditorContainerProps {
  // Optional controlled state for non-router environments (desktop app)
  searchState?: {
    index: number;
    expanded: boolean;
    contentExpanded: boolean;
    optionsExpanded: boolean;
    solutionsExpanded: boolean;
    tagsExpanded: boolean;
    packageExpanded: boolean;
    variablesExpanded: boolean;
    reasonExpanded: boolean;
    previewExpanded: boolean;
    tab: string;
  };
  onSearchStateChange?: (updater: (prev: any) => any) => void;
  showBackTitle?: boolean;
  backToUrl?: string;
  onNavigatePromptGenerator?: () => void;
  headerExtraActions?: React.ReactNode;
}

export function JsonQuestionsEditorContainer({
  searchState: externalState,
  onSearchStateChange,
  showBackTitle = true,
  backToUrl,
  onNavigatePromptGenerator,
  headerExtraActions,
}: JsonQuestionsEditorContainerProps) {
  const { t } = useAppTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local fallback state if no external search state handler is passed
  const [internalState, setInternalState] = useState({
    index: 0,
    expanded: true,
    contentExpanded: true,
    optionsExpanded: true,
    solutionsExpanded: true,
    tagsExpanded: true,
    packageExpanded: true,
    variablesExpanded: true,
    reasonExpanded: true,
    previewExpanded: true,
    tab: "edit",
  });

  const state = externalState || internalState;
  const updateState = (updater: (prev: any) => any) => {
    if (onSearchStateChange) {
      onSearchStateChange(updater);
    } else {
      setInternalState((prev) => updater(prev));
    }
  };

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
  } = state;

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const setSelectedIndex = (index: number) => updateState((prev) => ({ ...prev, index }));
  const setIsExpanded = (expanded: boolean) => updateState((prev) => ({ ...prev, expanded }));
  const setContentExpanded = (contentExpanded: boolean) => updateState((prev) => ({ ...prev, contentExpanded }));
  const setOptionsExpanded = (optionsExpanded: boolean) => updateState((prev) => ({ ...prev, optionsExpanded }));
  const setSolutionsExpanded = (solutionsExpanded: boolean) => updateState((prev) => ({ ...prev, solutionsExpanded }));
  const setTagsExpanded = (tagsExpanded: boolean) => updateState((prev) => ({ ...prev, tagsExpanded }));
  const setVariablesExpanded = (variablesExpanded: boolean) => updateState((prev) => ({ ...prev, variablesExpanded }));
  const setReasonExpanded = (reasonExpanded: boolean) => updateState((prev) => ({ ...prev, reasonExpanded }));
  const setPreviewExpanded = (previewExpanded: boolean) => updateState((prev) => ({ ...prev, previewExpanded }));
  const setTab = (tab: string) => updateState((prev) => ({ ...prev, tab }));
  const setPackageExpanded = (expanded: boolean) => updateState((prev) => ({ ...prev, packageExpanded: expanded }));

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
    packageId: z.uuid().nullish(),
    sectionId: z.uuid().nullish(),
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
        showBack={showBackTitle}
        backTo={backToUrl}
        extra={
          <div className="flex items-center gap-2">
            {headerExtraActions}
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
              onNavigatePromptGenerator={onNavigatePromptGenerator || (() => { })}

            />
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
