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
    { value: "createdAt", label: t(($) => $.exam.packages.table.sort.createdAt) },
    { value: "title", label: t(($) => $.exam.packages.table.sort.title) },
    // { value: 'rating', label: t($ => $.exam.packages.table.sort.rating) },
    // { value: 'totalQuestions', label: t($ => $.exam.packages.table.sort.totalQuestions) },
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
        <SelectTrigger className="w-[160px]">
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
      <Button variant="outline" onClick={toggleSortOrder} className="p-0 h-9 w-9">
        {sortOrder === "asc" ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
