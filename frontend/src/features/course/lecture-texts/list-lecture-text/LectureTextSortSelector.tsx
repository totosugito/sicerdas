import { SortSelector } from "@/features/components";
import { useAppTranslation } from "@/lib/i18n-typed";

interface LectureTextSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  disabled?: boolean;
}

export const LectureTextSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange,
  disabled,
}: LectureTextSortSelectorProps) => {
  const { t } = useAppTranslation();

  const sortOptions = [
    { value: "createdAt", label: t(($) => $.course.lectureTexts.table.sort.createdAt) },
    { value: "updatedAt", label: t(($) => $.course.lectureTexts.table.sort.updatedAt) },
    { value: "title", label: t(($) => $.course.lectureTexts.table.sort.title) },
    { value: "status", label: t(($) => $.course.lectureTexts.table.sort.status) },
  ];

  return (
    <SortSelector
      options={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      placeholder={t(($) => $.course.lectureTexts.table.sort.placeholder)}
      disabled={disabled}
    />
  );
};
