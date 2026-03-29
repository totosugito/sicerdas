import { GripVertical, Edit2, Trash2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ExamQuestionSolution } from "@/api/exam-question-solutions";
import { blocknote_to_text, blocknote_to_html } from "@/lib/blocknote-utils";
import { LongText } from "@/components/custom/components";
import React, { useEffect, useState } from "react";

interface SolutionRowProps {
  solution: ExamQuestionSolution;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const SolutionRow = ({ solution, index, onDelete, onEdit }: SolutionRowProps) => {
  const { t } = useAppTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: solution.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [htmlContent, setHtmlContent] = useState<string>("");
  const plainText = blocknote_to_text(solution.content);

  useEffect(() => {
    if (solution.content) {
      blocknote_to_html(solution.content).then((html) => setHtmlContent(html));
    }
  }, [solution.content]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative border rounded-xl overflow-hidden shadow-sm transition-all ${
        isDragging
          ? "shadow-lg opacity-90 z-50 border-primary bg-card"
          : "border-border bg-card hover:shadow-md dark:hover:bg-accent/5"
      }`}
    >
      <div className="bg-primary/5 px-5 py-3 border-b border-border flex justify-between items-center group-hover:bg-primary/10 transition-colors">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary touch-none p-1 rounded-md hover:bg-primary/10 transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <Lightbulb className="h-4 w-4" />
          </div>
          <span className="font-semibold text-primary">{solution.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal capitalize h-6">
            {solution.requiredTier || "Free Tier"}
          </Badge>
          <Badge variant="outline" className="font-normal capitalize h-6 border-dashed">
            {solution.solutionType?.replace("_", " ") || "General"}
          </Badge>
          <div className="flex gap-1 ml-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(solution.id)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(solution.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-sm text-foreground/80 dark:text-foreground/90">
          {htmlContent || plainText ? (
            <LongText text={htmlContent || plainText} isHtml={!!htmlContent} maxChars={1024} />
          ) : (
            <span className="text-muted-foreground italic">
              {t(($) => $.exam.options.noContent)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
