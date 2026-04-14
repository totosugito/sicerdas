import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { useAppStore } from "@/stores/useAppStore";
import { PromptGeneratorForm } from "@/components/pages/exam/questions/prompt-generator";

export const Route = createFileRoute("/(pages)/exam/(questions)/admin/prompt-generator")({
  component: PromptGeneratorPage,
});

function PromptGeneratorPage() {
  const { t } = useAppTranslation();
  const storeParams = useAppStore((state) => state.promptGeneratorParams);
  const setStoreParams = useAppStore((state) => state.setPromptGeneratorParams);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <PageTitle
          title={t(($) => $.exam.questions.jsonQuestions.promptGeneratorButton)}
          description={
            <span>{t(($) => $.exam.questions.jsonQuestions.promptGenerator.description)}</span>
          }
          showBack
          backTo={AppRoute.exam.questions.admin.importJson.url}
        />
      </div>

      <PromptGeneratorForm defaultValues={storeParams} onPersist={setStoreParams} />
    </div>
  );
}
