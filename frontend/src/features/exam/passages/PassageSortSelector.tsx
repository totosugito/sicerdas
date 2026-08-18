import { useAppTranslation } from "@/lib/i18n-typed";
import { SortSelector } from "@/features/components";

interface PassageSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  disabled?: boolean;
}

export const PassageSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange,
  disabled,
}: PassageSortSelectorProps) => {
  const { t } = useAppTranslation();

  const sortOptions = [
    { value: "updatedAt", label: t(($) => $.exam.passages.table.columns.updatedAt) },
    { value: "title", label: t(($) => $.exam.passages.table.columns.title) },
    { value: "subjectName", label: t(($) => $.exam.passages.table.columns.subject) },
    { value: "totalQuestions", label: t(($) => $.exam.passages.table.columns.questions) },
  ];

  return (
    <SortSelector
      options={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      placeholder={t(($) => $.labels.sortBy)}
      disabled={disabled}
    />
  );
};
