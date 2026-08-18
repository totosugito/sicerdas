import { LayoutGrid, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewModeToggleProps<T extends string = "table" | "card" | "grid" | "list"> {
  viewMode: T;
  onViewModeChange: (viewMode: T) => void;
  tableLabel?: string;
  cardLabel?: string;
  leftMode?: T;
  rightMode?: T;
  leftLabel?: string;
  rightLabel?: string;
  iconOnly?: boolean;
  disabled?: boolean;
}

export const ViewModeToggle = <T extends string = "table" | "card" | "grid" | "list">({
  viewMode,
  onViewModeChange,
  tableLabel,
  cardLabel,
  leftMode,
  rightMode,
  leftLabel,
  rightLabel,
  iconOnly = false,
  disabled,
}: ViewModeToggleProps<T>) => {
  const isGridList = viewMode === "grid" || viewMode === "list" || leftMode === "list" || rightMode === "grid";
  const defaultLeft = (isGridList ? "list" : "table") as T;
  const defaultRight = (isGridList ? "grid" : "card") as T;

  const actualLeftMode = leftMode ?? defaultLeft;
  const actualRightMode = rightMode ?? defaultRight;

  const actualLeftLabel = leftLabel ?? tableLabel ?? (actualLeftMode === "list" ? "List" : "Table");
  const actualRightLabel = rightLabel ?? cardLabel ?? (actualRightMode === "grid" ? "Grid" : "Card");

  return (
    <div className="flex items-center gap-1 bg-muted/50 p-[3px] rounded-md border border-border/40">
      <Button
        variant={viewMode === actualLeftMode ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "h-[28px] rounded-[8px] font-bold text-xs transition-all",
          iconOnly ? "w-[28px] p-0 flex items-center justify-center" : "px-3 gap-2",
          viewMode === actualLeftMode ? "bg-background shadow-sm" : "",
        )}
        onClick={() => onViewModeChange(actualLeftMode)}
        disabled={disabled}
      >
        <ListIcon className="h-3.5 w-3.5" />
        {!iconOnly && <span>{actualLeftLabel}</span>}
      </Button>
      <Button
        variant={viewMode === actualRightMode ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "h-[28px] rounded-[8px] font-bold text-xs transition-all",
          iconOnly ? "w-[28px] p-0 flex items-center justify-center" : "px-3 gap-2",
          viewMode === actualRightMode ? "bg-background shadow-sm" : "",
        )}
        onClick={() => onViewModeChange(actualRightMode)}
        disabled={disabled}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        {!iconOnly && <span>{actualRightLabel}</span>}
      </Button>
    </div>
  );
};
