import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";
import { JsonQuestionsEditorContainer } from "@/features/exam/questions/json-questions";

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
  const searchState = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleSearchStateChange = (updater: (prev: any) => any) => {
    navigate({ search: (prev: any) => updater(prev), replace: true, resetScroll: false });
  };

  return (
    <JsonQuestionsEditorContainer
      searchState={searchState}
      onSearchStateChange={handleSearchStateChange}
      showBackTitle={true}
      backToUrl={AppRoute.exam.questions.admin.list.url}
      onNavigatePromptGenerator={() =>
        navigate({ to: AppRoute.exam.questions.admin.promptGenerator.url })
      }
    />
  );
}
