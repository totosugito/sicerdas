import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppTranslation } from "@/lib/i18n-typed";
import { SortAsc, SortDesc } from "lucide-react";

interface ExamSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export const ExamSortSelector = ({ sortBy, sortOrder, onSortChange }: ExamSortSelectorProps) => {
  const { t } = useAppTranslation();

  const handleValueChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split(":") as [string, "asc" | "desc"];
    onSortChange(newSortBy, newSortOrder);
  };

  const currentValue = `${sortBy}:${sortOrder}`;

  const sortOptions = [
    { label: t(($) => $.general.newest), value: "createdAt:desc" },
    { label: t(($) => $.general.oldest), value: "createdAt:asc" },
    { label: t(($) => $.general.titleAz), value: "title:asc" },
    { label: t(($) => $.general.titleZa), value: "title:desc" },
    { label: t(($) => $.exam.sort.highestRating), value: "stats.rating:desc" },
    { label: t(($) => $.exam.sort.mostQuestions), value: "stats.totalQuestions:desc" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline-block text-sm text-slate-500 dark:text-slate-400">
        {t(($) => $.general.sortBy)}:
      </span>
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px] h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-slate-400">
          <SelectValue placeholder={t(($) => $.general.sortBy)} />
        </SelectTrigger>
        <SelectContent
          align="end"
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full gap-2">
                <span>{option.label}</span>
                {option.value.endsWith(":asc") ? (
                  <SortAsc className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <SortDesc className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
