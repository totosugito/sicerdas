import { SortSelector } from "@/features/components";
import { useAppTranslation } from "@/lib/i18n-typed";

interface CourseSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  disabled?: boolean;
}

export const CourseSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange,
  disabled,
}: CourseSortSelectorProps) => {
  const { t } = useAppTranslation();

  const sortOptions = [
    { value: "updatedAt", label: t(($) => $.course.courses.table.sort.updatedAt) },
    { value: "createdAt", label: t(($) => $.course.courses.table.sort.createdAt) },
    { value: "courseCode", label: t(($) => $.course.courses.table.sort.courseCode) },
    { value: "courseName", label: t(($) => $.course.courses.table.sort.courseName) },
    { value: "price", label: t(($) => $.course.courses.table.sort.price) },
    { value: "status", label: t(($) => $.course.courses.table.sort.status) },
  ];

  return (
    <SortSelector
      options={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      placeholder={t(($) => $.course.courses.table.sort.placeholder)}
      disabled={disabled}
    />
  );
};
