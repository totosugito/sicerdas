import { useAppTranslation } from "@/lib/i18n-typed";
import { SortSelector } from "@/features/components";

interface PackageSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export const PackageSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange,
}: PackageSortSelectorProps) => {
  const { t } = useAppTranslation();

  const sortOptions = [
    { value: "updatedAt", label: t(($) => $.exam.packages.table.sort.updatedAt) },
    { value: "title", label: t(($) => $.exam.packages.table.sort.title) },
    { value: "examType", label: t(($) => $.exam.packages.table.sort.examType) },
    { value: "durationMinutes", label: t(($) => $.exam.packages.table.sort.duration) },
    { value: "isActive", label: t(($) => $.exam.packages.table.sort.status) },
    { value: "versionId", label: t(($) => $.exam.packages.table.sort.version) },
    { value: "totalSections", label: t(($) => $.exam.packages.table.sort.totalSections) },
    { value: "activeSections", label: t(($) => $.exam.packages.table.sort.activeSections) },
    { value: "totalQuestions", label: t(($) => $.exam.packages.table.sort.totalQuestions) },
    { value: "activeQuestions", label: t(($) => $.exam.packages.table.sort.activeQuestions) },
    { value: "viewCount", label: t(($) => $.exam.packages.table.sort.viewCount) },
    { value: "bookmarkCount", label: t(($) => $.exam.packages.table.sort.bookmarkCount) },
    { value: "rating", label: t(($) => $.exam.packages.table.sort.rating) },
  ];

  return (
    <SortSelector
      options={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      placeholder={t(($) => $.exam.packages.table.sort.placeholder)}
    />
  );
};
