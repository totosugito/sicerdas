import React from "react";
import { ChapterItem } from "@/api/course/chapters";
import { CourseStructureChapter } from "@/api/course/courses/admin/structure-course";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChapterRow } from "./ChapterRow";

interface ChapterListProps {
  items: CourseStructureChapter[];
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
  onAdd: () => void;
  onEdit: (chapter: ChapterItem) => void;
  onDelete: (chapter: ChapterItem) => void;
}

export function ChapterList({
  items,
  sensors,
  onDragEnd,
  onAdd,
  onEdit,
  onDelete,
}: ChapterListProps) {
  const { t } = useAppTranslation();

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/20 space-y-3">
        <div className="p-3 bg-primary/10 text-primary rounded-full">
          <Layers className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-sm">{t(($) => $.course.chapters.emptyTitle)}</h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            {t(($) => $.course.chapters.emptyDesc)}
          </p>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-2 mt-2">
          <Plus className="h-4 w-4" />
          <span>{t(($) => $.course.chapters.createButton)}</span>
        </Button>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <ChapterRow
              key={item.id}
              chapter={item}
              lectures={item.lectures}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
