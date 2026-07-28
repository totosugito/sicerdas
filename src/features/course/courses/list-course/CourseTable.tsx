import { CourseItem, PaginatedCourseListResponse } from "@/api/course/courses";
import {
  DataTable,
  useDataTable,
  createRowNumberColumn,
  DataTableColumnHeader,
  PaginationData,
} from "@/components/table";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Eye, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { CourseStatusBadge } from "../components/CourseStatusBadge";

interface CourseTableProps {
  data: PaginatedCourseListResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  setSearch: (search: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onDelete: (course: CourseItem) => void;
  showPagination?: boolean;
}

export function CourseTable({
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
}: CourseTableProps) {
  const { t } = useAppTranslation();

  const columns: ColumnDef<CourseItem>[] = [
    createRowNumberColumn<CourseItem>({
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
      accessorKey: "courseName",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.courses.table.columns.name)}
        />
      ),
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="font-medium text-primary">
            <Link
              to={AppRoute.course.courses.admin.detail.url.replace("$id", course.id)}
              className="hover:underline"
            >
              {row.getValue("courseName")}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.courses.table.columns.category)}
        />
      ),
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <Badge variant="outline" className="font-normal">
            {category.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        );
      },
    },
    {
      accessorKey: "grade",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.education.grade.table.columns.grade)}
        />
      ),
      cell: ({ row }) => {
        const grade = row.original.grade;
        return grade ? (
          <Badge variant="outline" className="font-normal">
            {grade.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        );
      },
    },
    {
      accessorKey: "status",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.courses.table.columns.status)}
        />
      ),
      cell: ({ row }) => <CourseStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.courses.table.columns.createdAt)}
        />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {string_to_locale_date("id-ID", row.getValue("createdAt"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.courses.table.columns.actions)}
        />
      ),
      cell: ({ row }) => {
        const course = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t(($) => $.labels.actions)}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.course.courses.admin.detail.url.replace("$id", course.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.preview)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.course.courses.admin.edit.url.replace("$id", course.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.edit)}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(course)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t(($) => $.labels.delete)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const { table } = useDataTable({
    data: data?.data?.items || [],
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
      defaultNoResultText={t(($) => $.course.courses.table.noData)}
      showPagination={showPagination}
    />
  );
}
