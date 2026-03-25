import { ExamQuestion, ListQuestionsResponse } from "@/api/exam-questions";
import {
  DataTable,
  useDataTable,
  DataTableFilter,
  createRowNumberColumn,
  DataTableColumnHeader,
  PaginationData,
} from "@/components/custom/table";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { string_to_locale_date } from "@/lib/my-utils";
import { blocknote_to_text } from "@/lib/blocknote-utils";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { LongText } from "@/components/custom/components";

interface QuestionTableProps {
  data: ListQuestionsResponse | undefined;
  isLoading: boolean;
  paginationData: PaginationData | undefined;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  setSearch: (search: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onDelete: (question: ExamQuestion) => void;
}

export function QuestionTable({
  data,
  isLoading,
  paginationData,
  onPaginationChange,
  setSearch,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
}: QuestionTableProps) {
  const { t } = useAppTranslation();

  const columns: ColumnDef<ExamQuestion>[] = [
    createRowNumberColumn<ExamQuestion>({
      id: "no",
      size: 50,
      paginationData: paginationData,
    }),
    {
      accessorKey: "content",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.content)}
        />
      ),
      cell: ({ row }) => {
        const question = row.original;
        const plainText = blocknote_to_text(question.content);
        return (
          <div className="min-w-[200px]">
            <Link
              to={AppRoute.exam.questions.admin.detail.url.replace("$id", question.id)}
              className="hover:underline font-medium text-primary block"
            >
              <LongText text={plainText} maxChars={100} />
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "subjectName",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.subject)}
        />
      ),
      cell: ({ row }) =>
        row.getValue("subjectName") || (
          <span className="text-muted-foreground italic text-xs">-</span>
        ),
    },
    {
      accessorKey: "educationGradeName",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.educationGrade)}
        />
      ),
      cell: ({ row }) =>
        row.getValue("educationGradeName") || (
          <span className="text-muted-foreground italic text-xs">-</span>
        ),
    },
    {
      accessorKey: "requiredTier",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.requiredTier)}
        />
      ),
      cell: ({ row }) => {
        const tier = row.getValue("requiredTier") as string;
        return (
          <Badge variant="secondary" className="capitalize">
            {tier || "Free"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalOptions",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.totalOptions)}
          className="justify-center text-center"
        />
      ),
      cell: ({ row }) => {
        const total = row.getValue("totalOptions") as number;
        return <div className="flex justify-center font-medium">{total || 0}</div>;
      },
    },
    {
      accessorKey: "type",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.type)}
          className="justify-center text-center"
        />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <div className="flex justify-center">
            <Badge variant="outline" className="capitalize">
              {type.replace("_", " ")}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      enableSorting: true,
      size: 70,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.status)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <div className="flex justify-center">
            <Badge variant={isActive ? "success" : "secondary"}>
              {isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      enableSorting: true,
      minSize: 100,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.updatedAt)}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground lowercase">
          {string_to_locale_date("id-ID", row.getValue("updatedAt"))}
        </span>
      ),
    },
    {
      id: "actions",
      minSize: 50,
      maxSize: 50,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.labels.actions)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const question = row.original;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t(($) => $.labels.openMenu)}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t(($) => $.labels.actions)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.exam.questions.admin.edit.url.replace("$id", question.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.edit)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(question)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t(($) => $.labels.delete)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const { table } = useDataTable({
    data: data?.data.items || [],
    columns,
    pageCount: paginationData?.totalPages || -1,
    initialState: {
      pagination: {
        pageIndex: (paginationData?.page || 1) - 1,
        pageSize: paginationData?.limit || 10,
      },
      sorting: [
        {
          id: sortBy,
          desc: sortOrder === "desc",
        },
      ],
    },
    manualSorting: true,
    onSortingChange: (updater: any) => {
      const nextSorting =
        typeof updater === "function" ? updater(table.getState().sorting) : updater;
      if (nextSorting && nextSorting.length > 0) {
        onSortChange(nextSorting[0].id, nextSorting[0].desc ? "desc" : "asc");
      } else {
        onSortChange("updatedAt", "desc");
      }
    },
    manualPagination: true,
    onPaginationChange: (updater: any) => {
      const nextPagination =
        typeof updater === "function" ? updater(table.getState().pagination) : updater;
      if (onPaginationChange) {
        onPaginationChange({
          page: nextPagination.pageIndex + 1,
          limit: nextPagination.pageSize,
        });
      }
    },
    manualFiltering: true,
    onGlobalFilterChange: (searchValue: any) => {
      setSearch(searchValue);
    },
  });

  return (
    <div className="flex flex-col gap-4 border border-border rounded-lg bg-card shadow-sm overflow-hidden text-sm">
      <div className={"flex flex-row gap-2 justify-between px-4 pt-4"}>
        <div />
        <div className={"flex flex-row gap-2 w-full max-w-sm"}>
          <DataTableFilter
            table={table}
            searchPlaceholder={t(($) => $.exam.questions.table.search)}
            className="w-full"
            searchOnEnter={true}
          />
        </div>
      </div>
      <DataTable
        table={table}
        paginationData={paginationData}
        totalRowCount={paginationData?.total || 0}
        showSideBorders={false}
        showZebraStriping={true}
        defaultNoResultText={t(($) => $.exam.questions.table.noResult)}
      />
    </div>
  );
}
