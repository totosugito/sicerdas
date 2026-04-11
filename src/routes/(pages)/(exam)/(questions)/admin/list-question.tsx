import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useListQuestion,
  useDeleteQuestion,
  ExamQuestion,
  ListQuestionsResponse,
  EnumDifficultyLevel,
  EnumQuestionType,
  EnumScoringStrategy,
} from "@/api/exam-questions";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useEffect, useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/app";
import { LayoutGrid, ListIcon, Plus, Trash2, Search, X, ChevronDown, FileJson } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogModal } from "@/components/custom/components";
import {
  QuestionTable,
  QuestionCardList,
  QuestionSortSelector,
} from "@/components/pages/exam/questions/list-question";
import { PaginationData, DataTablePagination } from "@/components/custom/table";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";

export const Route = createFileRoute("/(pages)/(exam)/(questions)/admin/list-question")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
    subjectId: z.string().uuid().optional().catch(undefined),
    difficulty: z
      .enum(Object.values(EnumDifficultyLevel) as [string, ...string[]])
      .optional()
      .catch(undefined),
    type: z
      .enum(Object.values(EnumQuestionType) as [string, ...string[]])
      .optional()
      .catch(undefined),
    scoringStrategy: z
      .enum(Object.values(EnumScoringStrategy) as [string, ...string[]])
      .optional()
      .catch(undefined),
    view: z.enum(["table", "card"]).optional().catch(undefined),
  }),
  component: AdminExamQuestionsPage,
});

function AdminExamQuestionsPage() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  // States for pagination, search, and sorting
  const page = searchParams.page ?? 1;
  const limit = searchParams.limit ?? 10;
  const search = searchParams.search ?? "";
  const sortBy = searchParams.sortBy ?? "updatedAt";
  const sortOrder = searchParams.sortOrder ?? "desc";
  const viewMode = searchParams.view ?? "table";
  const { subjectId, difficulty, type, scoringStrategy } = searchParams;

  const { examQuestions, setExamQuestions } = useAppStore();
  const [searchTerm, setSearchTerm] = useState(search);

  // Sync with store on mount - if view is missing, use store value
  useEffect(() => {
    if (!searchParams.view) {
      navigate({
        search: { ...searchParams, view: examQuestions.viewMode },
        replace: true,
      });
    }
  }, []);

  // Sync store with current URL params
  useEffect(() => {
    setExamQuestions({
      viewMode,
      limit: searchParams.limit ?? 10,
      sortBy: sortBy,
      sortOrder: sortOrder,
      search: searchParams.search ?? "",
    });
  }, [viewMode, searchParams.limit, sortBy, sortOrder, searchParams.search]);

  // API Hooks
  const { data, isLoading } = useListQuestion({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    subjectId,
    difficulty,
    type,
    scoringStrategy,
  });

  const deleteMutation = useDeleteQuestion();

  // Dialog & Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ExamQuestion | null>(null);

  // Handlers
  const handleDelete = (question: ExamQuestion) => {
    setSelectedQuestion(question);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedQuestion) return;
    deleteMutation.mutate(selectedQuestion.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.exam.questions.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-questions-list"] });
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
          title={t(($) => $.exam.questions.title)}
          description={<span>{t(($) => $.exam.questions.description)}</span>}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex-shrink-0 gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t(($) => $.labels.add)}</span>
              <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/60">
            <DropdownMenuItem asChild>
              <Link to={AppRoute.exam.questions.admin.create.url} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                <span>{t(($) => $.labels.add)}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={AppRoute.exam.questions.admin.importJson.url} className="cursor-pointer">
                <FileJson className="mr-2 h-4 w-4" />
                <span>{t(($) => $.exam.questions.importJson)}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Unified Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t(($) => $.exam.questions.table.search)}
            className="pl-10 h-10 bg-background/50 border-border/60 rounded-xl focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate({
                  search: { ...searchParams, search: searchTerm || undefined, page: 1 },
                  replace: true,
                });
              }
            }}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchTerm("");
                navigate({
                  search: { ...searchParams, search: undefined, page: 1 },
                  replace: true,
                });
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:ml-auto">
          <QuestionSortSelector
            sortBy={sortBy}
            sortOrder={sortOrder as "asc" | "desc"}
            onSortChange={(newSortBy, newSortOrder) => {
              navigate({
                search: { ...searchParams, sortBy: newSortBy, sortOrder: newSortOrder, page: 1 },
                replace: true,
              });
            }}
          />

          <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/40">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-3 rounded-lg font-bold text-xs gap-2 transition-all",
                viewMode === "table" ? "bg-background shadow-sm" : "",
              )}
              onClick={() =>
                navigate({ search: { ...searchParams, view: "table" }, replace: true })
              }
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>{t(($) => $.exam.packages.table.viewModes.table)}</span>
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-3 rounded-lg font-bold text-xs gap-2 transition-all",
                viewMode === "card" ? "bg-background shadow-sm" : "",
              )}
              onClick={() => navigate({ search: { ...searchParams, view: "card" }, replace: true })}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{t(($) => $.exam.packages.table.viewModes.card)}</span>
            </Button>
          </div>
        </div>
      </div>

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
            <QuestionTable
              data={data as ListQuestionsResponse}
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
              showPagination={false}
              showToolbar={false}
            />
          ) : (
            <QuestionCardList
              data={data as ListQuestionsResponse}
              isLoading={isLoading}
              paginationData={data?.data.meta as PaginationData}
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
              setPageIndex={() => {}}
              pageSize={(data.data.meta as PaginationData).limit || 10}
              setPageSize={() => {}}
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

      <DialogModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.exam.questions.delete.confirmTitle),
          desc: t(($) => $.exam.questions.delete.confirmDesc),
          infoContainer: t(($) => $.exam.questions.delete.deleteInfo),
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
