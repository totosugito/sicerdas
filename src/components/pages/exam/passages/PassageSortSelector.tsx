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

interface PassageSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export const PassageSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange,
}: PassageSortSelectorProps) => {
  const { t } = useAppTranslation();

  const sortOptions = [
    { value: "updatedAt", label: t(($) => $.exam.passages.table.columns.updatedAt) },
    { value: "title", label: t(($) => $.exam.passages.table.columns.title) },
    { value: "subjectName", label: t(($) => $.exam.passages.table.columns.subject) },
    { value: "totalQuestions", label: t(($) => $.exam.passages.table.columns.questions) },
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
          <SelectValue placeholder={t(($) => $.labels.sortBy)} />
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
