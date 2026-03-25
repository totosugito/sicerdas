import { SectionQuestionItem } from "@/api/exam-package-sections/types";
import {
  DataTable,
  useDataTable,
  DataTableColumnHeader,
  createRowNumberColumn,
} from "@/components/custom/table";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { blocknote_to_text } from "@/lib/blocknote-utils";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { LongText } from "@/components/custom/components";

import { PaginationData } from "@/components/custom/table";

interface SectionQuestionTableProps {
  questions: SectionQuestionItem[];
  meta: PaginationData | undefined;
  onPaginationChange: (pagination: { page: number; limit: number }) => void;
  isLoading?: boolean;
}

export function SectionQuestionTable({
  questions,
  meta,
  onPaginationChange,
  isLoading = false,
}: SectionQuestionTableProps) {
  const { t } = useAppTranslation();

  const columns: ColumnDef<SectionQuestionItem>[] = [
    createRowNumberColumn<SectionQuestionItem>({
      id: "no",
      size: 50,
      paginationData: meta,
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
        const plainText = blocknote_to_text(question.content as any);
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
      accessorKey: "difficulty",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.difficulty)}
        />
      ),
      cell: ({ row }) => {
        const diff = row.original.difficulty;
        return (
          <Badge variant="outline" className="capitalize">
            {t(($) => $.exam.questions.form.difficulty.options[diff as "easy" | "medium" | "hard"])}
          </Badge>
        );
      },
    },
    {
      accessorKey: "type",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.exam.questions.table.columns.type)}
        />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="secondary" className="capitalize">
            {type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "order",
      size: 80,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sort" className="justify-center" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline" className="font-bold border-primary/30 text-primary">
            #{row.original.order}
          </Badge>
        </div>
      ),
    },
  ];

  const { table } = useDataTable({
    data: questions,
    columns,
    pageCount: meta?.totalPages || -1,
    initialState: {
      pagination: {
        pageIndex: (meta?.page || 1) - 1,
        pageSize: meta?.limit || 10,
      },
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
  });

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden text-sm">
      <DataTable
        table={table}
        paginationData={meta}
        totalRowCount={meta?.total || 0}
        showSideBorders={false}
        showZebraStriping={true}
        defaultNoResultText={t(($) => $.exam.questions.table.noResult)}
      />
    </div>
  );
}
