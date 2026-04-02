import { AppVersion, ListVersionResponse } from "@/api/version";
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

interface VersionTableProps {
  data: ListVersionResponse | undefined;
  isLoading: boolean;
  paginationData: PaginationData | undefined;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  setSearch: (search: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onDelete: (version: AppVersion) => void;
}

export function VersionTable({
  data,
  isLoading,
  paginationData,
  onPaginationChange,
  setSearch,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
}: VersionTableProps) {
  const { t } = useAppTranslation();

  const columns: ColumnDef<AppVersion>[] = [
    {
      accessorKey: "id",
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" className="justify-center text-center" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center text-center text-xs font-mono text-muted-foreground">
          {row.original.id}
        </div>
      ),
    },
    {
      accessorKey: "appVersion",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.version.table.columns.appVersion)}
          className="justify-center text-center"
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center text-center">
          <Badge variant="outline">{row.getValue("appVersion")}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "dbVersion",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.version.table.columns.dbVersion)}
          className="justify-center text-center"
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center text-center">
          <Badge variant="outline">{row.getValue("dbVersion")}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t(($) => $.version.table.columns.name)} />
      ),
      cell: ({ row }) => {
        const version = row.original;
        return (
          <div className="font-medium text-primary">
            <Link
              to={AppRoute.admin.version.edit.url.replace("$id", version.id.toString())}
              className="hover:underline"
            >
              {row.getValue("name") || (
                <span className="text-muted-foreground italic text-xs">No Name</span>
              )}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "note",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t(($) => $.version.fields.note)} />
      ),
      cell: ({ row }) => {
        const version = row.original;
        const plainText = blocknote_to_text(version.note || []);
        return (
          <div className="min-w-[200px]">
            <LongText text={plainText} maxChars={100} />
          </div>
        );
      },
    },
    {
      accessorKey: "dataType",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.version.table.columns.dataType)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="secondary">{row.getValue("dataType")}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.version.table.columns.status)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex justify-center">
            <Badge
              variant={
                status === "PUBLISHED" ? "success" : status === "DRAFT" ? "warning" : "secondary"
              }
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      enableSorting: true,
      minSize: 100,
      maxSize: 150,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.version.table.columns.updatedAt)}
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
        const version = row.original;

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
                  <Link to={AppRoute.admin.version.edit.url.replace("$id", version.id.toString())}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.edit)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(version)}
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
    <div className="flex flex-col gap-4 border border-border rounded-lg bg-card shadow-sm overflow-hidden">
      <div className={"flex flex-row gap-2 justify-between px-4 pt-6"}>
        <div />
        <div className={"flex flex-row gap-2 w-full max-w-sm"}>
          <DataTableFilter
            table={table}
            searchPlaceholder={t(($) => $.version.table.search)}
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
        defaultNoResultText={t(($) => $.version.table.noResult)}
      />
    </div>
  );
}
