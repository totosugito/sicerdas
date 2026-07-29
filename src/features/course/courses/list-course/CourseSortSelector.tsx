import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectPositioner,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpAZ, ArrowDownAZ, ArrowUpDown } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";

interface CourseSortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export const CourseSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange,
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

  const handleSortFieldChange = (value: string | null) => {
    if (value !== null) {
      onSortChange(value, sortOrder);
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={handleSortFieldChange}>
        <SelectTrigger className="w-[180px] bg-card shadow-sm border-border/60 flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <SelectValue
            placeholder={t(($) => $.course.courses.table.sort.placeholder)}
            render={(_, { value }) => {
              const matched = sortOptions.find((opt) => opt.value === value);
              const label = matched?.label || value;
              return <span className="text-left truncate block w-full">{label}</span>;
            }}
          />
        </SelectTrigger>
        <SelectPositioner>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectPositioner>
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
