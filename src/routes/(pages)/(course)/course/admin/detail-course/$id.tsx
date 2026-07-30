import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useQueryClient } from "@tanstack/react-query";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { PageTitle, ErrorContainer } from "@/components/general";
import { DialogModal } from "@/components/dialog";
import { AppRoute } from "@/constants/app-route";
import { useDetailCourse, useAdminCourseStructure } from "@/api/course/courses";
import { CourseStructureChapter } from "@/api/course/courses/admin/structure-course";
import {
  useDeleteChapter,
  useReorderChapter,
  ChapterItem,
} from "@/api/course/chapters";
import { CourseStatsHeader } from "@/features/course/courses/detail-course/CourseStatsHeader";
import { DialogChapterForm } from "@/features/course/courses/detail-course/DialogChapterForm";
import { ChapterList } from "@/features/course/courses/detail-course/ChapterList";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Layers, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export const Route = createFileRoute(
  "/(pages)/(course)/course/admin/detail-course/$id",
)({
  component: DetailCoursePage,
});

function DetailCoursePage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: detailData, isLoading, isError, error } = useDetailCourse(id);
  const course = detailData?.data;

  const { data: structureData, isLoading: isChaptersLoading } = useAdminCourseStructure(id);
  const deleteChapterMutation = useDeleteChapter();
  const reorderChapterMutation = useReorderChapter();

  const [items, setItems] = useState<CourseStructureChapter[]>([]);

  useEffect(() => {
    if (structureData?.data) {
      setItems(structureData.data);
    }
  }, [structureData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<CourseStructureChapter | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<CourseStructureChapter | null>(null);

  const handleAddChapter = () => {
    setSelectedChapter(null);
    setShowChapterModal(true);
  };

  const handleEditChapter = (chapter: ChapterItem) => {
    setSelectedChapter(chapter as CourseStructureChapter);
    setShowChapterModal(true);
  };

  const handleDeleteChapter = (chapter: ChapterItem) => {
    setChapterToDelete(chapter as CourseStructureChapter);
    setShowDeleteDialog(true);
  };

  const confirmDeleteChapter = () => {
    if (!chapterToDelete) return;

    deleteChapterMutation.mutate(chapterToDelete.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.course.chapters.deleteSuccess) });
        queryClient.invalidateQueries({ queryKey: ["admin-course-structure", id] });
        queryClient.invalidateQueries({ queryKey: ["admin-course-chapters-list", id] });
        queryClient.invalidateQueries({ queryKey: ["admin-course-courses-detail", id] });
        setShowDeleteDialog(false);
        setChapterToDelete(null);
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
        setShowDeleteDialog(false);
        setChapterToDelete(null);
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

        reorderChapterMutation.mutate(
          {
            courseId: id,
            items: reorderPayload,
          },
          {
            onSuccess: (res) => {
              showNotifSuccess({ message: res.message || "Urutan bab berhasil diperbarui" });
              queryClient.invalidateQueries({ queryKey: ["admin-course-structure", id] });
              queryClient.invalidateQueries({ queryKey: ["admin-course-chapters-list", id] });
            },
            onError: (err: any) => {
              showNotifError({ message: err.message || t(($) => $.labels.error) });
              queryClient.invalidateQueries({ queryKey: ["admin-course-structure", id] });
              queryClient.invalidateQueries({ queryKey: ["admin-course-chapters-list", id] });
            },
          },
        );

        return newItems;
      });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col w-full space-y-4 container mx-auto p-4 md:p-6">
        <ErrorContainer
          title={t(($) => $.labels.error)}
          message={error?.message || t(($) => $.course.courses.table.noData)}
          buttonText={t(($) => $.labels.cancel)}
          onButtonClick={() => navigate({ to: AppRoute.course.courses.admin.list.url })}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-6 container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageTitle
          title={course?.courseName || t(($) => $.course.courses.detail.title)}
          description={course?.courseDescription || t(($) => $.course.courses.detail.description)}
          showBack={true}
          backTo={AppRoute.course.courses.admin.list.url}
        />

        <div className="flex items-center gap-2">
          {course && (
            <Link to={AppRoute.course.courses.admin.edit.url.replace("$id", course.id)}>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                {t(($) => $.labels.edit)}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <CourseStatsHeader course={course} isLoading={isLoading} />

      {/* Chapters / Content Structure Section */}
      <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {t(($) => $.course.chapters.title)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(($) => $.course.chapters.description)}
            </p>
          </div>
          <Button onClick={handleAddChapter} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>{t(($) => $.course.chapters.createButton)}</span>
          </Button>
        </div>

        {isChaptersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <ChapterList
            items={items}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onAdd={handleAddChapter}
            onEdit={handleEditChapter}
            onDelete={handleDeleteChapter}
          />
        )}
      </div>

      <DialogChapterForm
        open={showChapterModal}
        onOpenChange={setShowChapterModal}
        chapter={selectedChapter}
        courseId={id}
      />

      <DialogModal
        variantSubmit="destructive"
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.course.chapters.deleteConfirmTitle),
          desc: (
            <span>
              {t(($) => $.course.chapters.deleteConfirmDesc)}{" "}
              <strong className="font-bold text-foreground underline decoration-destructive/40 underline-offset-2">
                {chapterToDelete?.chapterName || t(($) => $.course.chapters.unnamedChapter)}
              </strong>
              ?
            </span>
          ),
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          showInfoSection: true,
          infoTitle: t(($) => $.course.chapters.deleteInfoTitle),
          infoItems: [
            { text: t(($) => $.course.chapters.deleteConsequence1) },
            ...(chapterToDelete && chapterToDelete.lectures && chapterToDelete.lectures.length > 0
              ? [
                {
                  text: t(($) => $.course.chapters.deleteConsequenceWithCount, {
                    count: chapterToDelete.lectures.length,
                  }),
                },
              ]
              : []),
            { text: t(($) => $.course.chapters.deleteConsequence2) },
          ],
          textCancel: t(($) => $.labels.cancel),
          textConfirm: t(($) => $.labels.delete),
          onConfirmClick: confirmDeleteChapter,
          onCancelClick: () => {
            setShowDeleteDialog(false);
            setChapterToDelete(null);
          },
        }}
      />
    </div>
  );
}
