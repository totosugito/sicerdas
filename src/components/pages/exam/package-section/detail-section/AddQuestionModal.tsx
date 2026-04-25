import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  useDataTable,
  DataTableColumnHeader,
  createRowSelectColumn,
  createRowNumberColumn,
} from "@/components/custom/table";
import {
  useListQuestionSimple,
  ExamQuestion,
  EnumDifficultyLevel,
  EnumQuestionType,
} from "@/api/exam-questions";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { blocknote_to_text } from "@/lib/blocknote-utils";
import { LongText } from "@/components/custom/components";
import { PaginationData } from "@/components/custom/table";
import { Loader2, X } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useListSubjectSimple } from "@/api/exam-subjects";
import { useListGradeSimple } from "@/api/education-grade";
import { useListTier } from "@/api/app-tier";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms";
import { string_to_locale_date } from "@/lib/my-utils";
import i18n from "@/i18n";

interface AddQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (questionIds: string[]) => void;
  isAssigning?: boolean;
  packageId?: string;
  educationGradeId?: number | null;
}

type FilterValues = {
  subjectId: string;
  gradeId: string;
  tier: string;
  difficulty: string;
  type: string;
};

export function AddQuestionModal({
  open,
  onOpenChange,
  onConfirm,
  isAssigning = false,
  packageId,
  educationGradeId,
}: AddQuestionModalProps) {
  const { t } = useAppTranslation();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter Form
  const form = useForm<FilterValues>({
    defaultValues: {
      subjectId: "all",
      gradeId: "all",
      tier: "all",
      difficulty: "all",
      type: "all",
    },
  });

  // Set initial grade filter if educationGradeId is provided
  useEffect(() => {
    if (open && educationGradeId) {
      form.setValue("gradeId", educationGradeId.toString());
    }
  }, [open, educationGradeId, form]);

  const filterValues = form.watch();

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [
    filterValues.subjectId,
    filterValues.gradeId,
    filterValues.tier,
    filterValues.difficulty,
    filterValues.type,
  ]);

  // Fetch filter options
  const { data: subjectsData, isLoading: isLoadingSubjects } = useListSubjectSimple({
    page: 1,
    limit: 1000,
  });
  const { data: gradesData, isLoading: isLoadingGrades } = useListGradeSimple({
    page: 1,
    limit: 1000,
  });
  const { data: tiersData, isLoading: isLoadingTiers } = useListTier();

  const { data, isLoading, isFetching } = useListQuestionSimple(
    {
      page: pagination.page,
      limit: pagination.limit,
      subjectId: filterValues.subjectId === "all" ? undefined : filterValues.subjectId,
      educationGradeId: filterValues.gradeId === "all" ? undefined : Number(filterValues.gradeId),
      requiredTier: filterValues.tier === "all" ? undefined : filterValues.tier,
      difficulty: filterValues.difficulty === "all" ? undefined : (filterValues.difficulty as any),
      // type: filterValues.type === "all" ? undefined : (filterValues.type as any),
      excludePackageId: packageId,
      isActive: true,
      sortBy,
      sortOrder,
    },
    open,
  );

  const isTableLoading = isLoading || isFetching;

  const columns: ColumnDef<ExamQuestion>[] = [
    createRowSelectColumn<ExamQuestion>({
      id: "select",
      size: 40,
    }),
    createRowNumberColumn<ExamQuestion>({
      id: "no",
      size: 50,
      paginationData: data?.data.meta as PaginationData,
    }),
    {
      accessorKey: "content",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.content)}
        />
      ),
      cell: ({ row }) => {
        const plainText = blocknote_to_text(row.original.content as any);
        return <LongText text={plainText} maxChars={80} />;
      },
    },
    {
      accessorKey: "subjectName",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.subject)}
        />
      ),
      cell: ({ row }) => row.original.subjectName || "-",
    },
    // {
    //   accessorKey: "difficulty",
    //   enableSorting: true,
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title={t(($) => $.exam.questions.table.columns.difficulty)}
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const diff = row.original.difficulty;
    //     return (
    //       <Badge variant="outline" className="capitalize">
    //         {t(($) => $.exam.questions.form.difficulty.options[diff as "easy" | "medium" | "hard"])}
    //       </Badge>
    //     );
    //   },
    // },
    {
      accessorKey: "updatedAt",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.updatedAt)}
        />
      ),
      cell: ({ row }) => {
        return string_to_locale_date(i18n.language, row.original.updatedAt);
      },
    },
  ];

  const { table } = useDataTable({
    data: (data?.data.items || []) as ExamQuestion[],
    columns,
    pageCount: data?.data.meta.totalPages || -1,
    initialState: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
      sorting: [
        {
          id: sortBy,
          desc: sortOrder === "desc",
        },
      ],
    },
    manualPagination: true,
    manualSorting: true,
    onSortingChange: (updater: any) => {
      const nextSorting =
        typeof updater === "function" ? updater(table.getState().sorting) : updater;
      if (nextSorting && nextSorting.length > 0) {
        setSortBy(nextSorting[0].id);
        setSortOrder(nextSorting[0].desc ? "desc" : "asc");
      } else {
        setSortBy("updatedAt");
        setSortOrder("desc");
      }
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    onPaginationChange: (updater: any) => {
      const nextPagination =
        typeof updater === "function" ? updater(table.getState().pagination) : updater;
      setPagination({
        page: nextPagination.pageIndex + 1,
        limit: nextPagination.pageSize,
      });
    },
    getRowId: (row) => row.id,
  });

  const handleConfirm = () => {
    const selectedSelection = table.getState().rowSelection;
    const selectedIds = Object.keys(selectedSelection);
    if (selectedIds.length > 0) {
      onConfirm(selectedIds);
      table.resetRowSelection();
    }
  };

  const handleResetFilters = () => {
    form.reset();
    table.resetRowSelection();
  };

  const selectedCount = Object.keys(table.getState().rowSelection).length;
  const hasFilters =
    filterValues.subjectId !== "all" ||
    filterValues.gradeId !== "all" ||
    filterValues.tier !== "all" ||
    filterValues.difficulty !== "all" ||
    filterValues.type !== "all";

  const formConfig = {
    subjectId: {
      type: "select",
      name: "subjectId",
      label: t(($) => $.exam.questions.form.subject.label),
      placeholder: t(($) => $.exam.questions.form.subject.placeholder),
      options: [
        { label: t(($) => $.exam.packageQuestions.addModal.options.allSubjects), value: "all" },
        ...(subjectsData?.data.items || []),
      ],
      isLoading: isLoadingSubjects,
    },
    gradeId: {
      type: "select",
      name: "gradeId",
      label: t(($) => $.exam.questions.form.educationGrade.label),
      placeholder: t(($) => $.exam.questions.form.educationGrade.placeholder),
      options: [
        { label: t(($) => $.exam.packageQuestions.addModal.options.allGrades), value: "all" },
        ...(gradesData?.data.items || []),
      ],
      isLoading: isLoadingGrades,
    },
    tier: {
      type: "select",
      name: "tier",
      label: t(($) => $.exam.questions.form.requiredTier.label),
      placeholder: t(($) => $.exam.questions.form.requiredTier.placeholder),
      options: [
        { label: t(($) => $.exam.packageQuestions.addModal.options.allTiers), value: "all" },
        ...(tiersData?.data.map((t) => ({ label: t.name, value: t.slug })) || []),
      ],
      isLoading: isLoadingTiers,
    },
    type: {
      type: "select",
      name: "type",
      label: t(($) => $.exam.questions.form.type.label),
      placeholder: t(($) => $.exam.questions.form.type.placeholder),
      options: [
        { label: t(($) => $.exam.packageQuestions.addModal.options.allTypes), value: "all" },
        ...Object.values(EnumQuestionType).map((val) => ({
          label: t(($) => $.exam.questions.form.type.options[val as "multiple_choice" | "essay"]),
          value: val,
        })),
      ],
    },
    difficulty: {
      type: "select",
      name: "difficulty",
      label: t(($) => $.exam.questions.form.difficulty.label),
      placeholder: t(($) => $.exam.questions.form.difficulty.placeholder),
      options: [
        { label: t(($) => $.exam.packageQuestions.addModal.options.allDifficulties), value: "all" },
        ...Object.values(EnumDifficultyLevel).map((d) => ({
          label: t(
            ($) => $.exam.questions.form.difficulty.options[d as "easy" | "medium" | "hard"],
          ),
          value: d,
        })),
      ],
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>{t(($) => $.exam.packageQuestions.addModal.title)}</DialogTitle>
          <DialogDescription>
            {t(($) => $.exam.packageQuestions.addModal.description)}
          </DialogDescription>
        </DialogHeader>

        {/* Filters Section */}
        <div className="space-y-2 my-2 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2 h-8">
              {t(($) => $.exam.packageQuestions.addModal.filterTitle)}
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 gap-1 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <X className="h-3 w-3" />
                {t(($) => $.exam.packageQuestions.addModal.resetFilter)}
              </Button>
            )}
          </div>

          <Form {...form}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <ControlForm
                form={form}
                item={formConfig.subjectId}
                labelClassName="text-xs"
                showMessage={false}
                className="bg-card"
                wrapperClassName="min-w-0"
              />
              <ControlForm
                form={form}
                item={formConfig.gradeId}
                labelClassName="text-xs"
                showMessage={false}
                className="bg-card"
                wrapperClassName="min-w-0"
              />
              <ControlForm
                form={form}
                item={formConfig.tier}
                labelClassName="text-xs"
                showMessage={false}
                className="bg-card"
                wrapperClassName="min-w-0"
              />
              {/* <ControlForm form={form} item={formConfig.type} labelClassName="text-xs" showMessage={false} className="bg-card" wrapperClassName="min-w-0" /> */}
              <ControlForm
                form={form}
                item={formConfig.difficulty}
                labelClassName="text-xs"
                showMessage={false}
                className="bg-card"
                wrapperClassName="min-w-0"
              />
            </div>
          </Form>
        </div>

        <div className="flex-1 overflow-auto border-x border-b rounded-lg">
          <DataTable
            styles={{
              container: {
                default: "",
              },
            }}
            table={table}
            paginationData={data?.data.meta}
            totalRowCount={data?.data.meta.total || 0}
            showSideBorders={false}
            showZebraStriping={true}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t(($) => $.exam.packageQuestions.addModal.cancel)}
          </Button>
          <Button disabled={selectedCount === 0 || isAssigning} onClick={handleConfirm}>
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t(($) => $.exam.packageQuestions.addModal.confirm, { count: selectedCount })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
