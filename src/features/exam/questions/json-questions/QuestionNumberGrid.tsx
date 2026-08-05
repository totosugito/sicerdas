import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppTranslation } from "@/lib/i18n-typed";
import { LuUpload, LuCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface QuestionNumberGridProps {
  jsonQuestions: any[];
  selectedIndex: number;
  selectedIndices: number[];
  onSelect: (index: number) => void;
  onToggleSelect: (index: number) => void;
  onToggleSelectAll: () => void;
  onExport: () => void;
  isExporting: boolean;
  canExport: boolean;
}

export function QuestionNumberGrid({
  jsonQuestions,
  selectedIndex,
  selectedIndices,
  onSelect,
  onToggleSelect,
  onToggleSelectAll,
  onExport,
  isExporting,
  canExport,
}: QuestionNumberGridProps) {
  const { t } = useAppTranslation();

  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2.5 border rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-3">
      {/* Question Numbers */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pr-1 flex-1">
        {jsonQuestions.map((_, index) => {
          const isSelected = selectedIndices.includes(index);
          const isActive = selectedIndex === index;

          return (
            <div key={index} className="relative">
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "w-9 h-9 rounded-md border flex items-center justify-center text-xs font-bold transition-all relative select-none",
                  isActive
                    ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20"
                    : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {index + 1}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(index);
                }}
                title={isSelected ? "Unselect for export" : "Select for export"}
                className={cn(
                  "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full border flex items-center justify-center transition-all shadow-xs z-10 cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-muted-foreground/40 text-muted-foreground/30 hover:border-primary hover:text-primary"
                )}
              >
                <LuCheck className={cn("h-2.5 w-2.5 stroke-[3]", !isSelected && "opacity-0 hover:opacity-100")} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Controls on the Right */}
      <div className="flex items-center gap-3 shrink-0 ml-auto border-l pl-3 py-1">
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="select-all"
            checked={selectedIndices.length === jsonQuestions.length && jsonQuestions.length > 0}
            onCheckedChange={onToggleSelectAll}
          />
          <label htmlFor="select-all" className="text-xs font-medium cursor-pointer select-none whitespace-nowrap">
            {t(($) => $.exam.questions.jsonQuestions.globalParameters.selectAll)
              .replace("{selected}", selectedIndices.length.toString())
              .replace("{total}", jsonQuestions.length.toString())}
          </label>
        </div>
        <Button
          size="sm"
          onClick={onExport}
          disabled={!canExport || isExporting || selectedIndices.length === 0}
          variant="outline"
          className="h-8 text-xs gap-1.5 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all px-3"
        >
          {isExporting ? (
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <LuUpload className="h-3.5 w-3.5" />
          )}
          {t(($) => $.exam.questions.jsonQuestions.exportSelected)}
        </Button>
      </div>
    </div>
  );
}
