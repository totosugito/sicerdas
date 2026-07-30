import { LayoutGrid, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewModeToggleProps {
  viewMode: "table" | "card";
  onViewModeChange: (viewMode: "table" | "card") => void;
  tableLabel?: string;
  cardLabel?: string;
}

export const ViewModeToggle = ({
  viewMode,
  onViewModeChange,
  tableLabel = "Table",
  cardLabel = "Card",
}: ViewModeToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted/50 p-[3px] rounded-md border border-border/40">
      <Button
        variant={viewMode === "table" ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "h-[28px] px-3 rounded-[8px] font-bold text-xs gap-2 transition-all",
          viewMode === "table" ? "bg-background shadow-sm" : "",
        )}
        onClick={() => onViewModeChange("table")}
      >
        <ListIcon className="h-3.5 w-3.5" />
        <span>{tableLabel}</span>
      </Button>
      <Button
        variant={viewMode === "card" ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "h-[28px] px-3 rounded-[8px] font-bold text-xs gap-2 transition-all",
          viewMode === "card" ? "bg-background shadow-sm" : "",
        )}
        onClick={() => onViewModeChange("card")}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span>{cardLabel}</span>
      </Button>
    </div>
  );
};
