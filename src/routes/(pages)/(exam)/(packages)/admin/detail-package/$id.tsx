import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { DialogModal } from "@/components/custom/components";
import { PageTitle, ErrorContainer } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import {
  useListPackageSection,
  useDeletePackageSection,
  useUpdatePackageSection,
  ExamPackageSection,
} from "@/api/exam-package-sections";
import {
  SectionList,
  SectionListSkeleton,
  SectionEmptyState,
  DialogSectionForm,
} from "@/components/pages/exam/package-section/section-list";

export const Route = createFileRoute("/(pages)/(exam)/(packages)/admin/detail-package/$id")({
  component: DetailPackagePage,
});

function DetailPackagePage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useListPackageSection({
    packageId: id,
    limit: 50,
    sortBy: "order",
    sortOrder: "asc",
  });
  const deleteMutation = useDeletePackageSection();
  const updateMutation = useUpdatePackageSection();

  const [items, setItems] = useState<ExamPackageSection[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; title: string } | null>(
    null,
  );

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ExamPackageSection | null>(null);

  useEffect(() => {
    if (data?.data?.items) {
      const sorted = [...data.data.items].sort((a, b) => (a.order || 0) - (b.order || 0));
      setItems(sorted);
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDelete = (id: string, title: string) => {
    setSectionToDelete({ id, title });
    setShowDeleteDialog(true);
  };

  const handleEdit = (section: ExamPackageSection) => {
    setSelectedSection(section);
    setShowFormModal(true);
  };

  const handleAdd = () => {
    setSelectedSection(null);
    setShowFormModal(true);
  };

  const confirmDelete = () => {
    if (!sectionToDelete) return;

    deleteMutation.mutate(sectionToDelete.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
        setShowDeleteDialog(false);
        setSectionToDelete(null);
      },
      onError: (error: any) => {
        showNotifError({ message: error.message || t(($) => $.exam.sections.deleteError) });
        setShowDeleteDialog(false);
        setSectionToDelete(null);
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));

        Promise.all(
          updatedItems.map((item) =>
            updateMutation.mutateAsync({
              id: item.id,
              order: item.order,
            }),
          ),
        )
          .then(() => {
            showNotifSuccess({ message: t(($) => $.exam.sections.orderSuccess) });
            queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
          })
          .catch((error: any) => {
            showNotifError({ message: error.message || t(($) => $.exam.sections.orderError) });
            queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
          });

        return updatedItems;
      });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col w-full space-y-4">
        <ErrorContainer
          title={t(($) => $.exam.sections.notFound.title)}
          message={error?.message || t(($) => $.exam.sections.notFound.message)}
          buttonText={t(($) => $.exam.sections.notFound.backButton)}
          onButtonClick={() => navigate({ to: AppRoute.exam.packages.admin.list.url })}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="flex justify-between items-start">
        <PageTitle
          title={data?.data?.package?.packageName || t(($) => $.exam.sections.pageTitle)}
          description={t(($) => $.exam.sections.description)}
          showBack={true}
          backTo={AppRoute.exam.packages.admin.list.url}
        />
      </div>

      <div className="bg-card border rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-lg">{t(($) => $.exam.sections.title)}</h3>
            <p className="text-sm text-muted-foreground">{t(($) => $.exam.sections.description)}</p>
          </div>
          {items.length > 0 && (
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t(($) => $.exam.sections.createButton)}</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <SectionListSkeleton />
        ) : items.length === 0 ? (
          <SectionEmptyState onAdd={handleAdd} />
        ) : (
          <SectionList
            items={items}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      <DialogModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.exam.sections.deleteConfirm.title, { name: sectionToDelete?.title }),
          desc: t(($) => $.exam.sections.deleteConfirm.description),
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          showInfoSection: true,
          infoTitle: t(($) => $.exam.sections.deleteConfirm.infoTitle),
          infoItems: [
            { text: t(($) => $.exam.sections.deleteConfirm.consequence1) },
            { text: t(($) => $.exam.sections.deleteConfirm.consequence2) },
            { text: t(($) => $.exam.sections.deleteConfirm.consequence3) },
          ],
          textCancel: t(($) => $.exam.sections.deleteConfirm.cancel),
          textConfirm: t(($) => $.exam.sections.deleteConfirm.confirm),
          onConfirmClick: confirmDelete,
          onCancelClick: () => {
            setShowDeleteDialog(false);
            setSectionToDelete(null);
          },
        }}
      />

      <DialogSectionForm
        open={showFormModal}
        onOpenChange={setShowFormModal}
        section={selectedSection}
        packageId={id}
        packageIdDisabled={true}
      />
    </div>
  );
}
