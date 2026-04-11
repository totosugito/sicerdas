import { useAppTranslation } from "@/lib/i18n-typed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export function QuestionSortSelector({
  sortBy,
  sortOrder,
  onSortChange,
}: QuestionSortSelectorProps) {
  const { t } = useAppTranslation();

  const options = [
    { value: "updatedAt", label: t(($) => $.exam.questions.table.columns.updatedAt) },
    { value: "maxScore", label: t(($) => $.exam.questions.table.columns.maxScore) },
    { value: "difficulty", label: t(($) => $.exam.questions.table.columns.difficulty) },
    { value: "type", label: t(($) => $.exam.questions.table.columns.type) },
  ];

  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={(value) => onSortChange(value, sortOrder)}>
        <SelectTrigger className="h-10 w-[180px] bg-background/50 border-border/60 rounded-xl">
          <SelectValue placeholder={t(($) => $.labels.sortBy)} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl hover:bg-muted transition-colors"
        onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
      >
        {sortOrder === "asc" ? (
          <ArrowUpAZ className="h-4 w-4 text-primary" />
        ) : (
          <ArrowDownAZ className="h-4 w-4 text-primary" />
        )}
      </Button>
    </div>
  );
}
