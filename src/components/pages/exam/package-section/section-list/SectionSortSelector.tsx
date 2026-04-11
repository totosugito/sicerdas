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

  // Note: I should probably refined labels in locale for better UX, but let's use what's available
  // Actually, I'll check the locale to see if there are better keys.

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
