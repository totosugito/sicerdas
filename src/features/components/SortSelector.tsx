import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectPositioner,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpAZ, ArrowDownAZ, ArrowUpDown } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

interface SortSelectorProps {
  options: SortOption[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  placeholder?: string;
}

export const SortSelector = ({
  options,
  sortBy,
  sortOrder,
  onSortChange,
  placeholder = "Sort by...",
}: SortSelectorProps) => {
  const handleSortFieldChange = (value: string | null) => {
    if (value !== null) {
      onSortChange(value, sortOrder);
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    onSortChange(sortBy, newOrder);
  };

  const selectedLabel = options.find((o) => o.value === sortBy)?.label;

  return (
    <div className="flex items-center gap-3">
      <Select value={sortBy} onValueChange={handleSortFieldChange}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2 min-w-0">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate text-left">{selectedLabel || placeholder}</span>
          </div>
        </SelectTrigger>
        <SelectPositioner>
          <SelectContent>
            {options.map((option) => (
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
        className=""
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
