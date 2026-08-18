import { useAppTranslation } from "@/lib/i18n-typed";
import { SortSelector } from "@/features/components";

interface CourseSortSelectorProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export const CourseSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange
}: CourseSortSelectorProps) => {
  const { t } = useAppTranslation();

  const sortOptions = [
    { value: 'createdAt', label: t(($) => $.course.public.newest) },
    { value: 'courseName', label: t(($) => $.course.public.courseName) },
  ];

  return (
    <SortSelector
      options={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      placeholder={t(($) => $.course.public.sort)}
    />
  );
};
