import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

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

  const handleSortFieldChange = (value: string) => {
    onSortChange(value, sortOrder);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={handleSortFieldChange}>
        <SelectTrigger className="w-[180px] bg-card shadow-sm border-border/60">
          <SelectValue placeholder={t(($) => $.exam.packages.table.sort.placeholder)} />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={toggleSortOrder}
        size="icon"
        className="bg-card shadow-sm border-border/60"
        title={sortOrder === "asc" ? "Ascending" : "Descending"}
      >
        {sortOrder === "asc" ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
