import { SectionQuestionItem } from "@/api/exam-package-sections/types";
import { DataTableColumnHeader, DataTablePagination } from "@/components/custom/table";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { blocknote_to_text } from "@/lib/blocknote-utils";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { LongText } from "@/components/custom/components";
import { DialogModal } from "@/components/custom/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { PaginationData } from "@/components/custom/table";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableRow } from "./SortableRow";
import { useState } from "react";

interface SectionQuestionTableProps {
  questions: SectionQuestionItem[];
  meta: PaginationData | undefined;
  onPaginationChange: (pagination: { page: number; limit: number }) => void;
  onReorder: (questionIds: string[]) => void;
  onRemove: (questionId: string) => void;
  isLoading?: boolean;
}

export function SectionQuestionTable({
  questions,
  meta,
  onPaginationChange,
  onReorder,
  onRemove,
  isLoading = false,
}: SectionQuestionTableProps) {
  const { t } = useAppTranslation();
  const [questionIdToRemove, setQuestionIdToRemove] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const columns: ColumnDef<SectionQuestionItem>[] = [
    {
      id: "drag-handle",
      size: 40,
      header: () => null,
    },
    {
      id: "no",
      header: () => <div className="text-center w-full">No</div>,
      size: 50,
      cell: ({ row }) => {
        const index = meta ? (meta.page - 1) * meta.limit + row.index + 1 : row.index + 1;
        return <div className="text-center">{index}</div>;
      },
    },
    {
      accessorKey: "content",
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
      size: 80,
      minSize: 80,
      maxSize: 80,
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
    // {
    //   accessorKey: "type",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title={t(($) => $.exam.questions.table.columns.type)}
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const type = row.getValue("type") as string;
    //     return (
    //       <Badge variant="secondary" className="capitalize">
    //         {type.replace("_", " ")}
    //       </Badge>
    //     );
    //   },
    // },
    {
      id: "actions",
      size: 50,
      header: () => <div className="text-center w-full">{t(($) => $.labels.action)}</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setQuestionIdToRemove(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const paginationState: PaginationState = {
    pageIndex: (meta?.page || 1) - 1,
    pageSize: meta?.limit || 10,
  };

  const table = useReactTable({
    data: questions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta?.totalPages || -1,
    state: {
      pagination: paginationState,
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(paginationState) : updater;
      onPaginationChange({ page: next.pageIndex + 1, limit: next.pageSize });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over?.id);

      const newOrder = [...questions];
      const [movedItem] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, movedItem);

      onReorder(newOrder.map((q) => q.id));
    }
  };

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden text-sm">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <Table className="border-separate border-spacing-0">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 border-b border-r last:border-r-0 font-semibold"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.length > 0 ? (
                table
                  .getRowModel()
                  .rows.map((row) => <SortableRow key={row.original.id} row={row} />)
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground italic"
                  >
                    {isLoading
                      ? t(($) => $.labels.loading)
                      : t(($) => $.exam.questions.table.noResult)}
                  </TableCell>
                </TableRow>
              )}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>

      <div className="p-4 border-t">
        <DataTablePagination
          pageIndex={table.getState().pagination.pageIndex}
          setPageIndex={table.setPageIndex}
          pageSize={table.getState().pagination.pageSize}
          setPageSize={table.setPageSize}
          rowsCount={meta?.total || 0}
          paginationData={meta}
        />
      </div>

      <DialogModal
        open={!!questionIdToRemove}
        onOpenChange={(open) => !open && setQuestionIdToRemove(null)}
        modal={{
          title: t(($) => $.exam.packageQuestions.removeModal.title),
          desc: t(($) => $.exam.packageQuestions.removeModal.description),
          textConfirm: t(($) => $.exam.packageQuestions.removeModal.confirm),
          textCancel: t(($) => $.exam.packageQuestions.removeModal.cancel),
          onConfirmClick: () => {
            if (questionIdToRemove) {
              onRemove(questionIdToRemove);
              setQuestionIdToRemove(null);
            }
          },
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
        }}
      />
    </div>
  );
}
