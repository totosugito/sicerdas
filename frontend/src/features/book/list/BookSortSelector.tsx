import { useAppTranslation } from "@/lib/i18n-typed";
import { SortSelector } from "@/features/components";

interface BookSortSelectorProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export const BookSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange
}: BookSortSelectorProps) => {
  const { t } = useAppTranslation();

  const sortOptions = [
    { value: 'createdAt', label: t($ => $.book.info.sort.createdAt) },
    { value: 'title', label: t($ => $.book.info.sort.title) },
    // { value: 'rating', label: t($ => $.book.info.sort.rating) },
    { value: 'viewCount', label: t($ => $.book.info.sort.viewCount) },
    // { value: 'downloadCount', label: t($ => $.book.info.sort.downloadCount) },
  ];

  return (
    <SortSelector
      options={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      placeholder={t($ => $.book.info.sort.placeholder)}
    />
  );
};