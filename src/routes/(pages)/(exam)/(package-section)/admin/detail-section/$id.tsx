import { createFileRoute } from "@tanstack/react-router";
import { useDetailPackageSection } from "@/api/exam-package-sections";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle, LoadingView, ErrorContainer } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import {
  SectionQuestionTable,
  SectionInfoCard,
} from "@/components/pages/exam/package-section/detail-section";
import { useState } from "react";

export const Route = createFileRoute("/(pages)/(exam)/(package-section)/admin/detail-section/$id")({
  component: AdminPackageSectionDetailPage,
});

function AdminPackageSectionDetailPage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const {
    data: sectionData,
    isLoading,
    isError,
    error,
    refetch,
  } = useDetailPackageSection(id, pagination);

  const section = sectionData?.data;

  if (isLoading && !section) {
    return <LoadingView />;
  }

  if (isError || !section) {
    return (
      <ErrorContainer
        title={t(($) => $.exam.sections.notFound.title)}
        message={error?.message || t(($) => $.exam.sections.notFound.message)}
        onButtonClick={() => refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-10">
      <PageTitle
        title={t(($) => $.exam.sections.table.actions.detail)}
        description={section.title}
        showBack
        backTo={AppRoute.exam.packageSections.admin.list.url}
      />

      {/* Info Card Row - Now takes full width at the top */}
      <SectionInfoCard section={section} />

      {/* Questions List Section */}
      <SectionQuestionTable
        questions={section.questions.items}
        meta={section.questions.meta}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  );
}
