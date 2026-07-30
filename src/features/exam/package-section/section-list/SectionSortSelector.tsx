import { useAppTranslation } from "@/lib/i18n-typed";
import { SortSelector } from "@/features/components";

interface SectionSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export const SectionSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange,
}: SectionSortSelectorProps) => {
  const { t } = useAppTranslation();

  const sortOptions = [
    { value: "order", label: t(($) => $.labels.order) },
    { value: "updatedAt", label: t(($) => $.exam.sections.table.columns.updatedAt) },
    { value: "title", label: t(($) => $.exam.sections.table.columns.title) },
    { value: "groupName", label: t(($) => $.exam.sections.table.columns.groupName) },
    { value: "totalQuestions", label: t(($) => $.exam.sections.table.columns.questions) },
    {
      value: "activeQuestions",
      label: t(($) => $.exam.sections.table.columns.questions) + " (Aktif)",
    },
  ];

  return (
    <SortSelector
      options={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      placeholder={t(($) => $.labels.sortBy)}
    />
  );
};
