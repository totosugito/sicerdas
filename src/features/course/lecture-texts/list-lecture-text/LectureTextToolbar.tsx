import React from "react";
import { Search, X, LayoutGrid, ListIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface LectureTextToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  viewMode: "table" | "card";
  onViewModeChange: (viewMode: "table" | "card") => void;
}

export function LectureTextToolbar({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  onClearSearch,
  viewMode,
  onViewModeChange,
}: LectureTextToolbarProps) {
  const { t } = useAppTranslation();

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-xs">
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(($) => $.course.lectureTexts.table.search)}
          className="pl-10 h-10 bg-background/50 border-border/60 rounded-xl focus-visible:ring-primary/20"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearchSubmit();
            }
          }}
        />
        {searchTerm && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            onClick={onClearSearch}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto lg:ml-auto">
        {/* Card / Table View Toggle */}
        <div className="flex items-center rounded-xl bg-background border border-border/60 p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 rounded-lg text-xs gap-1.5 font-medium transition-all",
              viewMode === "card"
                ? "bg-card shadow-xs text-foreground hover:bg-card"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onViewModeChange("card")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>{t(($) => $.course.lectureTexts.table.viewModes.card)}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 rounded-lg text-xs gap-1.5 font-medium transition-all",
              viewMode === "table"
                ? "bg-card shadow-xs text-foreground hover:bg-card"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onViewModeChange("table")}
          >
            <ListIcon className="h-3.5 w-3.5" />
            <span>{t(($) => $.course.lectureTexts.table.viewModes.table)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
