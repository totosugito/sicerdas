import React from "react";
import { GripVertical, Pencil, Trash2, FileText, Video, GraduationCap, FileMinus, MessageSquare, File, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LectureItem } from "@/api/course/lectures";
import { useAppTranslation } from "@/lib/i18n-typed";
import { EnumLectureType } from "@/api/course/types";

interface LectureRowProps {
  lecture: LectureItem;
  index: number;
  onEdit: (lecture: LectureItem) => void;
  onDelete: (lecture: LectureItem) => void;
  onPreview: (lecture: LectureItem) => void;
}

export function LectureRow({ lecture, index, onEdit, onDelete, onPreview }: LectureRowProps) {
  const { t } = useAppTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lecture.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getLectureIcon = (type: string) => {
    switch (type) {
      case EnumLectureType.VIDEO:
        return <Video className="h-4 w-4 text-sky-500" />;
      case EnumLectureType.EXAM:
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case EnumLectureType.TEXT:
        return <FileText className="h-4 w-4 text-amber-500" />;
      case EnumLectureType.PDF:
        return <FileMinus className="h-4 w-4 text-rose-500" />;
      case EnumLectureType.DISCUSSION:
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/40 transition-all ${
        isDragging
          ? "shadow-md opacity-90 z-20 border-primary bg-primary/5"
          : "hover:bg-muted/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground/30 cursor-grab active:cursor-grabbing hover:text-muted-foreground p-1 touch-none rounded hover:bg-secondary/50"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-card border border-border/40 text-foreground font-semibold text-xs shadow-2xs">
          {index + 1}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/40">
          {getLectureIcon(lecture.type)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h5 className="font-medium text-sm text-foreground">
              {lecture.title || t(($) => $.course.lectures.unnamedLecture)}
            </h5>
            <Badge
              variant={lecture.isActive ? "success" : "secondary"}
              className="text-[9px] px-1.5 py-0"
            >
              {lecture.isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
            </Badge>
            {lecture.type === EnumLectureType.EXAM && (lecture.extra as any)?.successThreshold !== undefined && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium"
              >
                {t(($) => $.course.lectures.form.successThreshold.label)}: {(lecture.extra as any).successThreshold}
              </Badge>
            )}
          </div>
          {lecture.description && (
            <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">
              {lecture.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPreview(lecture)}
          title={t(($) => $.labels.preview || "Pratinjau")}
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(lecture)}
          title={t(($) => $.labels.edit)}
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(lecture)}
          title={t(($) => $.labels.delete)}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive/80 hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
