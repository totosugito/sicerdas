import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppTranslation } from "@/lib/i18n-typed";
import { LuUpload } from "react-icons/lu";

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
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6 border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectedIndices.length === jsonQuestions.length && jsonQuestions.length > 0}
            onCheckedChange={onToggleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none">
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
          className="gap-2 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all ml-4 px-4"
        >
          {isExporting ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <LuUpload className="h-4 w-4" />
          )}
          {t(($) => $.exam.questions.jsonQuestions.exportSelected)}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {jsonQuestions.map((_, index) => (
          <div key={index} className="relative group">
            <Button
              variant={selectedIndex === index ? "subtle-primary" : "outline"}
              className="w-12 h-12 p-0 flex flex-col items-center justify-center relative overflow-hidden"
              onClick={() => onSelect(index)}
            >
              <span className="text-xs font-bold">{index + 1}</span>
            </Button>
            <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 z-20">
              <Checkbox
                checked={selectedIndices.includes(index)}
                onCheckedChange={() => onToggleSelect(index)}
                className="bg-background shadow-sm h-5 w-5 border-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
