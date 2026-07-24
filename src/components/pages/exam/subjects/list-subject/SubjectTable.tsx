import { SubjectData, SubjectListResponse } from "@/api/exam/subjects";
import {
  DataTable,
  useDataTable,
  DataTableFilter,
  createRowNumberColumn,
  DataTableColumnHeader,
  PaginationData,
} from "@/components/custom/table";
import { LongText } from "@/components/ui/long-text";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ColumnDef } from "@tanstack/react-table";
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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubjectTableProps {
  data: SubjectListResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  setSearch: (search: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onEdit: (subject: SubjectData) => void;
  onDelete: (subject: SubjectData) => void;
}

export function SubjectTable({
  data,
  isLoading,
  paginationData,
  onPaginationChange,
  setSearch,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
}: SubjectTableProps) {
  const { t } = useAppTranslation();

  const columns: ColumnDef<SubjectData>[] = [
    createRowNumberColumn<SubjectData>({
      id: "no",
      size: 50,
      paginationData: paginationData,
    }),
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.subjects.table.columns.name)}
        />
      ),
    },
    {
      accessorKey: "description",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.subjects.table.columns.description)}
        />
      ),
      cell: ({ row }) => (
        <LongText
          text={row.getValue("description") || "-"}
          title={row.getValue("name")}
          className="max-w-[300px] text-muted-foreground italic text-sm"
        />
      ),
    },
    {
      accessorKey: "isActive",
      enableSorting: true,
      minSize: 70,
      maxSize: 70,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.subjects.table.columns.status)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        const colorClass = isActive
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50 dark:text-red-400";

        const dotColor = isActive ? "bg-emerald-500" : "bg-red-500";
        const label = isActive
          ? t(($) => $.exam.subjects.table.status.active)
          : t(($) => $.exam.subjects.table.status.inactive);

        return (
          <div className="flex justify-center">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider",
                colorClass,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
              <span>{label}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      enableSorting: true,
      minSize: 100,
      maxSize: 100,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.subjects.table.columns.updatedAt)}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
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
          title={t(($) => $.exam.subjects.table.columns.actions)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const subject = row.original;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                  <span className="sr-only">
                    {t(($) => $.exam.subjects.table.actions.openMenu)}
                  </span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t(($) => $.exam.subjects.table.columns.actions)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(subject)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t(($) => $.exam.subjects.table.actions.edit)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(subject)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t(($) => $.exam.subjects.table.actions.delete)}
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
        onSortChange("name", "asc");
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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row justify-between bg-muted/30 border-b border-border space-y-0">
        <div className="flex items-center gap-2"></div>
        <div className={"flex flex-row gap-2 w-full sm:max-w-sm"}>
          <DataTableFilter
            table={table}
            searchPlaceholder={t(($) => $.exam.subjects.table.search)}
            className="w-full"
            searchOnEnter={true}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-2">
        <DataTable
          table={table}
          paginationData={paginationData}
          totalRowCount={paginationData?.total || 0}
          showSideBorders={false}
          showZebraStriping={true}
          defaultNoResultText={t(($) => $.exam.subjects.table.noResult)}
        />
      </CardContent>
    </Card>
  );
}
