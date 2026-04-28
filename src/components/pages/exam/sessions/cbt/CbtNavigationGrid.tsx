import React from "react";
import { useCbtStore } from "@/stores/useCbtStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type GridItemStatus = "unanswered" | "answered" | "doubtful" | "correct" | "wrong";

export interface GridItem {
  questionId: string;
  order: number;
  status: GridItemStatus;
}

interface CbtNavigationGridProps {
  items: GridItem[];
  mode: "study" | "tryout";
  onQuestionSelect: (questionId: string) => void;
  onToggleDoubtful: (questionId: string, isDoubtful: boolean) => void;
}

export const CbtNavigationGrid: React.FC<CbtNavigationGridProps> = ({
  items,
  mode,
  onQuestionSelect,
  onToggleDoubtful,
}) => {
  const { activeQuestionId } = useCbtStore();

  const getButtonVariant = (status: GridItemStatus) => {
    switch (status) {
      case "correct":
        return "bg-green-500 hover:bg-green-600 text-white border-transparent";
      case "wrong":
        return "bg-red-500 hover:bg-red-600 text-white border-transparent";
      case "doubtful":
        return "bg-yellow-400 hover:bg-yellow-500 text-black border-transparent";
      case "answered":
        return "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent";
      default:
        return "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border";
    }
  };

  const activeItem = items.find((item) => item.questionId === activeQuestionId);

  return (
    <div className="flex flex-col h-full bg-card border-l border-border/40 p-4 w-full md:w-[320px]">
      <div className="mb-4 pb-4 border-b border-border/40">
        <h3 className="font-semibold text-lg mb-2">Navigasi Soal</h3>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-secondary border border-border"></div> Belum
            Dijawab
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div> Sudah Dijawab
          </div>
          {mode === "tryout" && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div> Ragu-ragu
            </div>
          )}
          {mode === "study" && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Benar
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Salah
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 overflow-y-auto pb-4">
        {items.map((item) => (
          <Button
            key={item.questionId}
            variant="outline"
            className={`w-full aspect-square p-0 ${getButtonVariant(item.status)} ${
              activeQuestionId === item.questionId
                ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                : ""
            }`}
            onClick={() => onQuestionSelect(item.questionId)}
          >
            {item.order}
          </Button>
        ))}
      </div>

      {mode === "tryout" && activeItem && (
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center space-x-2">
          <Checkbox
            id="ragu-ragu"
            checked={activeItem.status === "doubtful"}
            onCheckedChange={(checked) => onToggleDoubtful(activeItem.questionId, !!checked)}
          />
          <Label htmlFor="ragu-ragu" className="text-sm font-medium cursor-pointer">
            Tandai Ragu-ragu
          </Label>
        </div>
      )}
    </div>
  );
};
