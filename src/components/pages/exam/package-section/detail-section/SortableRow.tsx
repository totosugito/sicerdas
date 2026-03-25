import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { flexRender, Row } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { SectionQuestionItem } from "@/api/exam-package-sections/types";

interface SortableRowProps {
  row: Row<SectionQuestionItem>;
}

export function SortableRow({ row }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.original.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn("group", isDragging && "z-50 bg-accent shadow-lg opacity-80")}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-2 px-3 border-b border-r last:border-r-0">
          {cell.column.id === "drag-handle" ? (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded w-full flex items-center justify-center"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}
