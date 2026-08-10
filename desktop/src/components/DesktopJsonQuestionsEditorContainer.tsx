import React, { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useAppStore } from "@/stores/useAppStore";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useListTagSimple } from "@/api/education/tags";
import { useAppForm } from "@/components/ui/form-tanstack";
import { EnumDifficultyLevel, EnumQuestionType } from "@/api/exam/questions/types";
import {
  GlobalParamsForm,
  PackageParamsForm,
  JsonQuestionEditView,
  useExportJsonQuestions,
} from "@/features/exam/questions/json-questions";
import { JsonQuestionImport } from "@/api/exam/questions/types";

export function DesktopJsonQuestionsEditorContainer() {
  const { t } = useAppTranslation();

  const [state, setState] = useState({
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

  const setSelectedIndex = (index: number) => setState((prev) => ({ ...prev, index }));
  const setExpanded = (expanded: boolean) => setState((prev) => ({ ...prev, expanded }));
  const setContentExpanded = (contentExpanded: boolean) =>
    setState((prev) => ({ ...prev, contentExpanded }));
  const setOptionsExpanded = (optionsExpanded: boolean) =>
    setState((prev) => ({ ...prev, optionsExpanded }));
  const setSolutionsExpanded = (solutionsExpanded: boolean) =>
    setState((prev) => ({ ...prev, solutionsExpanded }));
  const setTagsExpanded = (tagsExpanded: boolean) =>
    setState((prev) => ({ ...prev, tagsExpanded }));
  const setPackageExpanded = (packageExpanded: boolean) =>
    setState((prev) => ({ ...prev, packageExpanded }));
  const setVariablesExpanded = (variablesExpanded: boolean) =>
    setState((prev) => ({ ...prev, variablesExpanded }));
  const setReasonExpanded = (reasonExpanded: boolean) =>
    setState((prev) => ({ ...prev, reasonExpanded }));
  const setPreviewExpanded = (previewExpanded: boolean) =>
    setState((prev) => ({ ...prev, previewExpanded }));
  const setTab = (tab: string) => setState((prev) => ({ ...prev, tab }));

  const { data: tagsData } = useListTagSimple({ limit: 1000 });
  const jsonQuestions = useAppStore((state) => state.jsonQuestions);
  const setJsonQuestions = useAppStore((state) => state.setJsonQuestions);
  const setJsonQuestionsGlobalParams = useAppStore((state) => state.setJsonQuestionsGlobalParams);
  const setJsonQuestionsPackageParams = useAppStore(
    (state) => state.setJsonQuestionsPackageParams,
  );

  const globalForm = useAppForm({
    defaultValues: {
      subjectId: "",
      difficulty: EnumDifficultyLevel.EASY,
      type: EnumQuestionType.MULTIPLE_CHOICE,
      educationGradeId: "",
      requiredTier: "",
      passageId: "",
    },
    onSubmit: () => {},
  });

  const packageForm = useAppForm({
    defaultValues: {
      packageId: "",
      sectionId: "",
    },
    onSubmit: () => {},
  });

  React.useEffect(() => {
    if (jsonQuestions.length > 0) {
      const q0 = jsonQuestions[0] as any;
      if (q0) {
        if (q0.subjectId && !globalForm.state.values.subjectId) {
          globalForm.setFieldValue("subjectId", q0.subjectId);
        }
        if (q0.difficulty && !globalForm.state.values.difficulty) {
          globalForm.setFieldValue("difficulty", q0.difficulty as any);
        }
        if (q0.type && !globalForm.state.values.type) {
          globalForm.setFieldValue("type", q0.type as any);
        }
      }
    }
  }, [jsonQuestions, globalForm]);

  React.useEffect(() => {
    const sub = globalForm.store.subscribe((s: any) => {
      setJsonQuestionsGlobalParams(s.values);
    });
    return () => {
      if (typeof sub === "function") (sub as any)();
      else if (sub && typeof (sub as any).unsubscribe === "function") (sub as any).unsubscribe();
    };
  }, [globalForm, setJsonQuestionsGlobalParams]);

  React.useEffect(() => {
    const sub = packageForm.store.subscribe((s: any) => {
      setJsonQuestionsPackageParams(s.values);
    });
    return () => {
      if (typeof sub === "function") (sub as any)();
      else if (sub && typeof (sub as any).unsubscribe === "function") (sub as any).unsubscribe();
    };
  }, [packageForm, setJsonQuestionsPackageParams]);

  const { isExporting, handleExportSelected } = useExportJsonQuestions({
    globalForm,
    packageForm,
    jsonQuestions,
    setJsonQuestions,
    selectedIndices: jsonQuestions.map((_, i) => i),
    setSelectedIndices: () => {},
    setSelectedIndex,
    tagsData,
  });

  const handleUpdateQuestion = (updatedQuestion: JsonQuestionImport) => {
    const newJsonQuestions = [...jsonQuestions];
    newJsonQuestions[selectedIndex] = updatedQuestion;
    setJsonQuestions(newJsonQuestions);
  };

  const currentQuestion = jsonQuestions[selectedIndex];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Desktop Header Action Bar */}
      <div className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground">
            {jsonQuestions.length} {jsonQuestions.length === 1 ? "Soal Loaded" : "Soal Loaded"}
          </span>
        </div>

        <globalForm.Subscribe selector={(s: any) => s.values.subjectId}>
          {(subjectId: any) => {
            const canExport = !!(subjectId || jsonQuestions.some((q: any) => q.subjectId));
            return (
              <div className="flex items-center gap-3">
                {!canExport && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Pilih Mata Pelajaran (Subject) terlebih dahulu
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={handleExportSelected}
                  disabled={!canExport || isExporting}
                  className="gap-2 shadow-sm"
                >
                  {isExporting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {t(($) => $.exam.questions.jsonQuestions.exportSelected)}
                </Button>
              </div>
            );
          }}
        </globalForm.Subscribe>
      </div>

      <GlobalParamsForm form={globalForm} isOpen={isExpanded} onOpenChange={setExpanded} />

      <PackageParamsForm
        form={packageForm}
        isOpen={packageExpanded}
        onOpenChange={setPackageExpanded}
      />

      {/* Main Content Editor Area */}
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
  );
}
