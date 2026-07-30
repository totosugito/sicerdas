import { useAppTranslation } from "@/lib/i18n-typed";
import { SortSelector } from "@/features/components";

interface QuestionSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  disabled?: boolean;
}

export function QuestionSortSelector({
  sortBy,
  sortOrder,
  onSortChange,
  disabled,
}: QuestionSortSelectorProps) {
  const { t } = useAppTranslation();

  const options = [
    { value: "updatedAt", label: t(($) => $.exam.questions.table.columns.updatedAt) },
    { value: "maxScore", label: t(($) => $.exam.questions.table.columns.maxScore) },
    { value: "difficulty", label: t(($) => $.exam.questions.table.columns.difficulty) },
    { value: "type", label: t(($) => $.exam.questions.table.columns.type) },
  ];

  return (
    <SortSelector
      options={options}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      placeholder={t(($) => $.labels.sortBy)}
      disabled={disabled}
    />
  );
}
