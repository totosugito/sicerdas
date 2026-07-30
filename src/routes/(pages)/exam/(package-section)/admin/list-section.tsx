import { createFileRoute } from "@tanstack/react-router";
import {
  useListPackageSection,
  useDeletePackageSection,
  ExamPackageSection,
  ListSectionsResponse,
} from "@/api/exam/package-sections";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useEffect, useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/app";
import { Plus, Trash2 } from "lucide-react";
import { DialogModal } from "@/components/dialog";
import {
  SectionTable,
  SectionCardList,
  SectionToolbar,
  DialogSectionForm,
} from "@/features/exam/package-section/section-list";
import { PaginationData, DataTablePagination } from "@/components/table";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";
import { z } from "zod";

export const Route = createFileRoute("/(pages)/exam/(package-section)/admin/list-section")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
    packageId: z.string().optional().catch(undefined),
    examTypes: z.array(z.string()).optional().catch(undefined),
    view: z.enum(["table", "card"]).optional().catch(undefined),
  }),
  component: AdminExamPackageSectionsPage,
});

function AdminExamPackageSectionsPage() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  // States for pagination, search, and sorting
  const page = searchParams.page ?? 1;
  const limit = searchParams.limit ?? 10;
  const search = searchParams.search ?? "";
  const sortBy = searchParams.sortBy ?? "order";
  const sortOrder = searchParams.sortOrder ?? "asc";
  const viewMode = searchParams.view ?? "card";
  const packageId = searchParams.packageId;
  const examTypes = searchParams.examTypes ?? [];

  const { examSections, setExamSections } = useAppStore();
  const [searchTerm, setSearchTerm] = useState(search);

  // Sync with store on mount - if view is missing, use store value
  useEffect(() => {
    if (!searchParams.view) {
      navigate({
        search: { ...searchParams, view: examSections.viewMode },
        replace: true,
      });
    }
  }, []);

  // Sync store with current URL params
  useEffect(() => {
    setExamSections({
      viewMode,
      limit: searchParams.limit ?? 10,
      sortBy: sortBy,
      sortOrder: sortOrder,
      search: searchParams.search ?? "",
    });
  }, [viewMode, searchParams.limit, sortBy, sortOrder, searchParams.search]);

  // API Hooks
  const { data, isLoading } = useListPackageSection({
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    packageId,
    examType: examTypes.length > 0 ? examTypes : undefined,
  });

  const deleteMutation = useDeletePackageSection();

  // Dialog & Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ExamPackageSection | null>(null);

  // Handlers
  const handleAdd = () => {
    setSelectedSection(null);
    setShowFormModal(true);
  };

  const handleEdit = (section: ExamPackageSection) => {
    setSelectedSection(section);
    setShowFormModal(true);
  };

  const handleDelete = (section: ExamPackageSection) => {
    setSelectedSection(section);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedSection) return;
    deleteMutation.mutate(selectedSection.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.exam.sections.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
        setShowDeleteDialog(false);
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-start">
        <PageTitle
          title={t(($) => $.exam.sections.title)}
          description={<span>{t(($) => $.exam.sections.description)}</span>}
        />
        <Button onClick={handleAdd} className="flex-shrink-0 gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t(($) => $.labels.add)}</span>
        </Button>
      </div>

      <SectionToolbar
        searchTerm={searchTerm}
        onSearchTermChange={(val) => {
          setSearchTerm(val);
          navigate({
            search: { ...searchParams, search: val || undefined, page: 1 },
            replace: true,
          });
        }}
        onSearchSubmit={() => {
          navigate({
            search: { ...searchParams, search: searchTerm || undefined, page: 1 },
            replace: true,
          });
        }}
        onClearSearch={() => {
          setSearchTerm("");
          navigate({
            search: { ...searchParams, search: undefined, page: 1 },
            replace: true,
          });
        }}
        examTypes={examTypes}
        onExamTypesChange={(newTypes) => {
          navigate({
            search: { ...searchParams, examTypes: newTypes.length > 0 ? newTypes : undefined, page: 1 },
            replace: true,
          });
        }}
        sortBy={sortBy}
        sortOrder={sortOrder as "asc" | "desc"}
        onSortChange={(newSortBy, newSortOrder) => {
          navigate({
            search: { ...searchParams, sortBy: newSortBy, sortOrder: newSortOrder, page: 1 },
            replace: true,
          });
        }}
        viewMode={viewMode}
        onViewModeChange={(newView) => {
          navigate({ search: { ...searchParams, view: newView }, replace: true });
        }}
      />

      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "table"
            ? "bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            : "flex flex-col gap-4",
        )}
      >
        <div className={cn(viewMode === "table" ? "p-4" : "")}>
          {viewMode === "table" ? (
            <SectionTable
              data={data as ListSectionsResponse}
              isLoading={isLoading}
              paginationData={data?.data.meta as PaginationData}
              setSearch={(newSearch) => {
                navigate({
                  search: {
                    ...searchParams,
                    search: newSearch || undefined,
                    page: 1,
                  },
                  replace: true,
                });
              }}
              sortBy={sortBy}
              sortOrder={sortOrder as "asc" | "desc"}
              onSortChange={(newSortBy, newSortOrder) => {
                navigate({
                  search: {
                    ...searchParams,
                    sortBy: newSortBy,
                    sortOrder: newSortOrder,
                    page: 1,
                  },
                  replace: true,
                });
              }}
              onDelete={handleDelete}
              onEdit={handleEdit}
              showPagination={false}
              showToolbar={false}
            />
          ) : (
            <SectionCardList
              data={data as ListSectionsResponse}
              isLoading={isLoading}
              paginationData={data?.data.meta as PaginationData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Adaptive Pagination */}
        {!isLoading && data?.data.meta && (
          <div
            className={cn(
              "transition-all duration-300",
              viewMode === "table"
                ? "px-6 pb-6 pt-2 border-t border-border/40 bg-muted/5"
                : "bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm",
            )}
          >
            <DataTablePagination
              paginationData={data.data.meta as PaginationData}
              pageIndex={((data.data.meta as PaginationData).page || 1) - 1}
              setPageIndex={() => { }}
              pageSize={(data.data.meta as PaginationData).limit || 10}
              setPageSize={() => { }}
              rowsCount={(data.data.meta as PaginationData).total || 0}
              onPaginationChange={(pagination: { page: number; limit: number }) => {
                navigate({
                  search: {
                    ...searchParams,
                    page: pagination.page,
                    limit: pagination.limit,
                  },
                  replace: true,
                });
              }}
              showPageSize={true}
              showPageLabel={true}
            />
          </div>
        )}
      </div>

      <DialogSectionForm
        open={showFormModal}
        onOpenChange={setShowFormModal}
        section={selectedSection}
        packageId={packageId || undefined}
      />

      <DialogModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.exam.sections.delete.confirmTitle),
          desc: t(($) => $.exam.sections.delete.confirmDesc, { title: selectedSection?.title }),
          infoContainer: t(($) => $.exam.sections.delete.deleteInfo),
          infoContainerVariant: "error",
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          textCancel: t(($) => $.labels.cancel),
          textConfirm: t(($) => $.labels.delete),
          onConfirmClick: confirmDelete,
        }}
      />
    </div>
  );
}
