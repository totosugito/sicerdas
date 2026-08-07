import { CategoryData, CategoryListResponse } from "@/api/education/categories";
import {
  DataTable,
  useDataTable,
  DataTableFilter,
  DataTableColumnHeader,
  createRowNumberColumn,
  PaginationData,
  CustomColumnDef,
} from "@/components/table";
import { LongText } from "@/components/ui/long-text";
import { useAppTranslation } from "@/lib/i18n-typed";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveStatusBadge } from "@/features/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { string_to_locale_date } from "@/lib/my-utils";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface CategoryTableProps {
  data: CategoryListResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  setSearch: (search: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onEdit: (category: CategoryData) => void;
  onDelete: (category: CategoryData) => void;
}

export function CategoryTable({
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
}: CategoryTableProps) {
  const { t } = useAppTranslation();

  const columns: CustomColumnDef<CategoryData>[] = [
    createRowNumberColumn<CategoryData>({
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
          title={t(($) => $.education.categories.table.columns.name)}
        />
      ),
    },
    {
      accessorKey: "description",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.education.categories.table.columns.description)}
        />
      ),
      cell: ({ row }) => (
        <LongText
          text={row.getValue("description") || "-"}
          title={row.getValue("name")}
          className="text-muted-foreground italic text-sm"
        />
      ),
    },
    {
      accessorKey: "isActive",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.education.categories.table.columns.status)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <div className="flex justify-center">
            <ActiveStatusBadge isActive={isActive} />
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.education.categories.table.columns.updatedAt)}
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
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.education.categories.table.columns.actions)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const category = row.original;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">
                    {t(($) => $.education.categories.table.actions.openMenu)}
                  </span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {t(($) => $.education.categories.table.columns.actions)}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t(($) => $.education.categories.table.actions.edit)}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive focus:text-destructive" />
                    {t(($) => $.education.categories.table.actions.delete)}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
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
        typeof updater === "function" ? updater(table.state.sorting) : updater;
      if (nextSorting && nextSorting.length > 0) {
        onSortChange(nextSorting[0].id, nextSorting[0].desc ? "desc" : "asc");
      } else {
        onSortChange("updatedAt", "desc");
      }
    },
    manualPagination: true,
    onPaginationChange: (updater: any) => {
      const nextPagination =
        typeof updater === "function" ? updater(table.state.pagination) : updater;
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
        <div></div>
        <div className={"flex flex-row gap-2 w-full sm:max-w-sm"}>
          <DataTableFilter
            table={table}
            searchPlaceholder={t(($) => $.education.categories.table.search)}
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
          defaultNoResultText={t(($) => $.education.categories.table.noResult)}
        />
      </CardContent>
    </Card>
  );
}
