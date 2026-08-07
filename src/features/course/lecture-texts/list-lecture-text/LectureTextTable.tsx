import { LectureTextItem, PaginatedLectureTextListResponse } from "@/api/course/lecture-texts";
import {
  DataTable,
  useDataTable,
  DataTableFilter,
  createRowNumberColumn,
  DataTableColumnHeader,
  PaginationData,
  CustomColumnDef,
} from "@/components/table";
import { useAppTranslation } from "@/lib/i18n-typed";
import { FileText, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
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
import { CourseStatusBadge } from "@/features/components";
import { EnumContentStatus } from "@/api/types";

interface LectureTextTableProps {
  data: PaginatedLectureTextListResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onPreview: (article: LectureTextItem) => void;
  onDelete: (article: LectureTextItem) => void;
}

export function LectureTextTable({
  data,
  isLoading,
  paginationData,
  sortBy,
  sortOrder,
  onSortChange,
  onPreview,
  onDelete,
}: LectureTextTableProps) {
  const { t } = useAppTranslation();

  const columns: CustomColumnDef<LectureTextItem>[] = [
    createRowNumberColumn<LectureTextItem>({
      id: "no",
      size: 50,
      paginationData: paginationData,
    }),
    {
      accessorKey: "title",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.lectureTexts.table.title)}
        />
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2.5 font-medium text-foreground">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <span className="truncate max-w-[300px]">
              {item.title || t(($) => $.course.lectureTexts.unnamedArticle)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.courses.table.columns.category)}
        />
      ),
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <span className="text-xs font-medium">
            {category?.name || "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "grade",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.labels.level ?? "Tingkat")}
        />
      ),
      cell: ({ row }) => {
        const grade = row.original.grade;
        return (
          <span className="text-xs text-muted-foreground">
            {grade?.name || "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.labels.status)}
        />
      ),
      cell: ({ row }) => {
        return <CourseStatusBadge status={row.original.status || EnumContentStatus.DRAFT} />;
      },
    },
    {
      accessorKey: "content",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.lectureTexts.table.blocks)}
        />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.content?.length || 0} {t(($) => $.course.lectureTexts.blocksCount)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.lectureTexts.table.createdAt)}
        />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {string_to_locale_date("id-ID", row.getValue("createdAt"))}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.course.lectureTexts.table.updatedAt)}
        />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {string_to_locale_date("id-ID", row.getValue("updatedAt"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.labels.actions)}
        />
      ),
      cell: ({ row }) => {
        const item = row.original;
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
                <DropdownMenuItem onClick={() => onPreview(item)}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t(($) => $.labels.preview)}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.course.lectureTexts.admin.edit.url.replace("$id", item.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.edit)}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive focus:text-destructive" />
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
        typeof updater === "function" ? updater(table.state.sorting) : updater;
      if (nextSorting && nextSorting.length > 0) {
        onSortChange(nextSorting[0].id, nextSorting[0].desc ? "desc" : "asc");
      } else {
        onSortChange("createdAt", "desc");
      }
    },
    manualPagination: true,
  });

  return <DataTable table={table} />;
}
