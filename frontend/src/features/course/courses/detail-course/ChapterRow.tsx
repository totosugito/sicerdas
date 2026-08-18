import React, { useState, useEffect } from "react";
import { GripVertical, Pencil, Trash2, BookOpen, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChapterItem } from "@/api/course/chapters";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  useListLecture,
  useDeleteLecture,
  useReorderLecture,
  LectureItem,
} from "@/api/course/lectures";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { LectureRow } from "./LectureRow";
import { DialogLectureForm } from "./DialogLectureForm";
import { DialogModal } from "@/components/dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArticlePreview, SectionPreview } from "./DialogAssetPicker";
import { EnumLectureType } from "@/api/course/types";

interface ChapterRowProps {
  chapter: ChapterItem;
  lectures: LectureItem[];
  index: number;
  onEdit: (chapter: ChapterItem) => void;
  onDelete: (chapter: ChapterItem) => void;
}

export function ChapterRow({ chapter, lectures, index, onEdit, onDelete }: ChapterRowProps) {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Sorting sensors for lectures
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Lecture list API and mutations
  const deleteLectureMutation = useDeleteLecture();
  const reorderLectureMutation = useReorderLecture();

  const [items, setItems] = useState<LectureItem[]>([]);

  useEffect(() => {
    if (lectures) {
      setItems(lectures);
    }
  }, [lectures]);

  // Modal states for lectures
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<LectureItem | null>(null);

  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewLecture, setPreviewLecture] = useState<LectureItem | null>(null);

  const handleAddLecture = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLecture(null);
    setShowLectureModal(true);
    setIsExpanded(true);
  };

  const handleEditLecture = (lecture: LectureItem) => {
    setSelectedLecture(lecture);
    setShowLectureModal(true);
  };

  const handleDeleteLecture = (lecture: LectureItem) => {
    setLectureToDelete(lecture);
    setShowDeleteDialog(true);
  };

  const handlePreviewLecture = (lecture: LectureItem) => {
    setPreviewLecture(lecture);
    setShowPreviewDialog(true);
  };

  const confirmDeleteLecture = () => {
    if (!lectureToDelete) return;

    deleteLectureMutation.mutate(lectureToDelete.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.course.lectures.deleteSuccess) });
        queryClient.invalidateQueries({ queryKey: ["admin-course-structure", chapter.courseId] });
        queryClient.invalidateQueries({ queryKey: ["admin-course-chapters-list", chapter.courseId] });
        queryClient.invalidateQueries({ queryKey: ["admin-course-courses-detail", chapter.courseId] });
        setShowDeleteDialog(false);
        setLectureToDelete(null);
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
        setShowDeleteDialog(false);
        setLectureToDelete(null);
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(prevItems, oldIndex, newIndex);

        const reorderPayload = newItems.map((item, index) => ({
          id: item.id,
          position: (0.1 + index * 0.01).toFixed(4),
        }));

        reorderLectureMutation.mutate(
          {
            chapterId: chapter.id,
            items: reorderPayload,
          },
          {
            onSuccess: (res) => {
              showNotifSuccess({ message: res.message || "Urutan materi berhasil diperbarui" });
              queryClient.invalidateQueries({ queryKey: ["admin-course-structure", chapter.courseId] });
            },
            onError: (err: any) => {
              showNotifError({ message: err.message || t(($) => $.labels.error) });
              queryClient.invalidateQueries({ queryKey: ["admin-course-structure", chapter.courseId] });
            },
          }
        );

        return newItems;
      });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/chapter flex flex-col bg-card rounded-2xl border transition-all ${
        isDragging
          ? "shadow-lg opacity-90 z-10 border-primary bg-primary/5"
          : "hover:border-border border-border/60 shadow-2xs"
      }`}
    >
      {/* Chapter Main Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
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

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleAddLecture}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t(($) => $.course.lectures.createButton)}</span>
          </Button>

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
          <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />
          <Button variant="ghost" size="icon-sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Lectures Nested List */}
      {isExpanded && (
        <div className="border-t border-border/40 p-4 bg-muted/5 flex flex-col gap-3 rounded-b-2xl">
          {items.length === 0 ? (
            <div className="text-center py-6 border border-dashed rounded-xl bg-card">
              <p className="text-xs text-muted-foreground">Belum ada materi pembelajaran.</p>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 mt-2" onClick={handleAddLecture}>
                <Plus className="h-4.5 w-4.5" />
                <span>{t(($) => $.course.lectures.createButton)}</span>
              </Button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {items.map((item, idx) => (
                    <LectureRow
                      key={item.id}
                      lecture={item}
                      index={idx}
                      onEdit={handleEditLecture}
                      onDelete={handleDeleteLecture}
                      onPreview={handlePreviewLecture}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Lecture Modals */}
      <DialogLectureForm
        open={showLectureModal}
        onOpenChange={setShowLectureModal}
        lecture={selectedLecture}
        chapterId={chapter.id}
        courseId={chapter.courseId}
      />

      <DialogModal
        variantSubmit="destructive"
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.course.lectures.deleteConfirmTitle),
          desc: (
            <span>
              {t(($) => $.course.lectures.deleteConfirmDesc)}{" "}
              <strong className="font-bold text-foreground underline decoration-destructive/40 underline-offset-2">
                {lectureToDelete?.title || t(($) => $.course.lectures.unnamedLecture)}
              </strong>
              ?
            </span>
          ),
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          showInfoSection: true,
          infoTitle: t(($) => $.course.lectures.deleteInfoTitle),
          infoItems: [
            { text: t(($) => $.course.lectures.deleteConsequence1) },
            { text: t(($) => $.course.lectures.deleteConsequence2) },
          ],
          textCancel: t(($) => $.labels.cancel),
          textConfirm: t(($) => $.labels.delete),
          onConfirmClick: confirmDeleteLecture,
          onCancelClick: () => {
            setShowDeleteDialog(false);
            setLectureToDelete(null);
          },
        }}
      />
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[70vw] md:max-w-[60vw] lg:max-w-[800px] max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-lg font-bold text-foreground">
              {t(($) => $.labels.preview)}: {previewLecture?.title || ""}
            </DialogTitle>
            {previewLecture?.description && (
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {previewLecture.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 py-4 text-left">
            {previewLecture && (
              <>
                {previewLecture.type === EnumLectureType.TEXT && (
                  <ArticlePreview id={previewLecture.referenceUrl || ""} />
                )}
                {previewLecture.type === EnumLectureType.EXAM && (
                  <SectionPreview id={previewLecture.referenceUrl || ""} />
                )}
                {previewLecture.type === EnumLectureType.VIDEO && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg border text-sm">
                    <div>
                      <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Video Link / URL</span>
                      <a href={previewLecture.referenceUrl || ""} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs break-all block mt-1">
                        {previewLecture.referenceUrl}
                      </a>
                    </div>
                  </div>
                )}
                {previewLecture.type === EnumLectureType.PDF && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg border text-sm">
                    <div>
                      <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">PDF File URL</span>
                      <a href={previewLecture.referenceUrl || ""} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs break-all block mt-1">
                        {previewLecture.referenceUrl}
                      </a>
                    </div>
                  </div>
                )}
                {![EnumLectureType.TEXT, EnumLectureType.EXAM, EnumLectureType.VIDEO, EnumLectureType.PDF].includes(previewLecture.type as any) && (
                  <div className="text-xs text-muted-foreground italic text-center p-4">
                    {t(($) => $.course.lectures.picker.noAdditionalDetails)}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
