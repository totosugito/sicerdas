import React from "react";
import { GripVertical, Pencil, Trash2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChapterItem } from "@/api/course/chapters";
import { useAppTranslation } from "@/lib/i18n-typed";

interface ChapterRowProps {
  chapter: ChapterItem;
  index: number;
  onEdit: (chapter: ChapterItem) => void;
  onDelete: (chapter: ChapterItem) => void;
}

export function ChapterRow({ chapter, index, onEdit, onDelete }: ChapterRowProps) {
  const { t } = useAppTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-4 bg-card rounded-xl border transition-all ${
        isDragging
          ? "shadow-lg opacity-90 z-10 border-primary bg-primary/5"
          : "hover:bg-muted/30 border-border/60 shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground/40 cursor-grab active:cursor-grabbing hover:text-muted-foreground p-1 touch-none rounded hover:bg-secondary"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-xs">
          {index + 1}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground">
              {chapter.chapterName || t(($) => $.course.chapters.unnamedChapter)}
            </h4>
            <Badge
              variant={chapter.isActive ? "success" : "secondary"}
              className="text-[10px] px-2 py-0"
            >
              {chapter.isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              {t(($) => $.course.chapters.lecturesCount, { count: chapter.totalLectures ?? 0 })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(chapter)}
          title={t(($) => $.labels.edit)}
        >
          <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(chapter)}
          title={t(($) => $.labels.delete)}
        >
          <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
