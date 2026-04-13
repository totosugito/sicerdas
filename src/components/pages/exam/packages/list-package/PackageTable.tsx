import { ExamPackage, ListPackagesResponse } from "@/api/exam-packages";
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
import { MoreHorizontal, Pencil, Trash2, Eye, ImageIcon, Bookmark, Star } from "lucide-react";
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
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";

interface PackageTableProps {
  data: ListPackagesResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  setSearch: (search: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onDelete: (pkg: ExamPackage) => void;
  showPagination?: boolean;
}

export function PackageTable({
  data,
  isLoading,
  paginationData,
  onPaginationChange,
  setSearch,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
  showPagination = true,
}: PackageTableProps) {
  const { t } = useAppTranslation();

  const columns: ColumnDef<ExamPackage>[] = [
    createRowNumberColumn<ExamPackage>({
      id: "no",
      size: 50,
      paginationData: paginationData,
    }),
    {
      accessorKey: "thumbnail",
      enableSorting: false,
      header: "",
      size: 100,
      cell: ({ row }) => {
        const thumbnail = row.original.thumbnail;
        return (
          <div className="w-20 aspect-video rounded-md overflow-hidden bg-muted border border-border/50">
            {thumbnail ? (
              <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <ImageIcon className="h-4 w-4" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.title)}
        />
      ),
      cell: ({ row }) => {
        const pkg = row.original;
        return (
          <div className="font-medium text-primary">
            <Link
              to={AppRoute.exam.packages.admin.detail.url.replace("$id", pkg.id)}
              className="hover:underline"
            >
              {row.getValue("title")}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "categoryName",
      enableSorting: false, // Sorting by joined column names might need more complex backend logic
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.category)}
        />
      ),
      cell: ({ row }) =>
        row.getValue("categoryName") || (
          <span className="text-muted-foreground italic text-xs">-</span>
        ),
    },
    {
      accessorKey: "educationGradeName",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.educationGrade)}
        />
      ),
      cell: ({ row }) =>
        row.getValue("educationGradeName") || (
          <span className="text-muted-foreground italic text-xs">-</span>
        ),
    },
    {
      accessorKey: "examType",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.examType)}
        />
      ),
      cell: ({ row }) => {
        const examType = row.getValue("examType") as string;
        return (
          <Badge variant="outline" className="capitalize">
            {examType === "official"
              ? t(($) => $.exam.packages.form.examType.options.official)
              : examType === "custom_practice"
                ? t(($) => $.exam.packages.form.examType.options.custom_practice)
                : examType?.toString().replaceAll("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalSections",
      enableSorting: true,
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.sections)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const pkg = row.original;
        const inactive = Math.max(0, pkg.totalSections - pkg.activeSections);
        return (
          <div className="flex justify-center flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Badge variant="success" className="px-1.5 py-0 h-5 text-[10px]">
                {pkg.activeSections}
              </Badge>
              <span className="text-[10px] text-muted-foreground">/</span>
              <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] opacity-70">
                {inactive}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalQuestions",
      enableSorting: true,
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.questions)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const pkg = row.original;
        const inactive = Math.max(0, pkg.totalQuestions - pkg.activeQuestions);
        return (
          <div className="flex justify-center flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Badge variant="success" className="px-1.5 py-0 h-5 text-[10px]">
                {pkg.activeQuestions}
              </Badge>
              <span className="text-[10px] text-muted-foreground">/</span>
              <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] opacity-70">
                {inactive}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "viewCount",
      enableSorting: true,
      size: 80,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.views)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const viewCount = row.original.viewCount;
        return (
          <div className="flex justify-center items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-sm font-medium">{viewCount || 0}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "bookmarkCount",
      enableSorting: true,
      size: 80,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.bookmarks)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const bookmarkCount = row.original.bookmarkCount;
        return (
          <div className="flex justify-center items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-sm font-medium">{bookmarkCount || 0}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      enableSorting: true,
      size: 80,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.rating)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const rating = row.original.rating;
        return (
          <div className="flex justify-center items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-500/60 fill-amber-500/10" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {Number(rating).toFixed(1)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "durationMinutes",
      enableSorting: true,
      minSize: 70,
      maxSize: 100,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.duration)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const duration = row.getValue("durationMinutes") as number;
        return (
          <div className="flex justify-center">
            <span className="text-sm">{duration}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      enableSorting: true,
      size: 70,
      minSize: 70,
      maxSize: 70,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.status)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <div className="flex justify-center">
            <Badge variant={isActive ? "success" : "secondary"}>
              {isActive
                ? t(($) => $.exam.packages.table.status.active)
                : t(($) => $.exam.packages.table.status.inactive)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "versionId",
      enableSorting: true,
      size: 80,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.labels.version)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const versionId = row.getValue("versionId") as number | null;
        return (
          <div className="flex justify-center">
            <span className="text-sm font-mono text-muted-foreground">{versionId || "-"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      enableSorting: true,
      minSize: 70,
      maxSize: 100,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.packages.table.columns.updatedAt)}
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
          title={t(($) => $.exam.packages.table.columns.actions)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const pkg = row.original;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">
                    {t(($) => $.exam.packages.table.actions.openMenu)}
                  </span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t(($) => $.exam.packages.table.columns.actions)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.exam.packages.admin.detail.url.replace("$id", pkg.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t(($) => $.exam.packages.table.actions.detail)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.exam.packages.admin.edit.url.replace("$id", pkg.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t(($) => $.exam.packages.table.actions.edit)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(pkg)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t(($) => $.exam.packages.table.actions.delete)}
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
    <DataTable
      table={table}
      paginationData={paginationData}
      totalRowCount={paginationData?.total || 0}
      showSideBorders={true}
      showZebraStriping={true}
      defaultNoResultText={t(($) => $.exam.packages.table.noResult)}
      showPagination={showPagination}
    />
  );
}
