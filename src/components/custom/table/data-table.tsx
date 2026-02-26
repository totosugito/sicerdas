import { ColumnDef, flexRender, type Table as TanstackTable, type Header } from "@tanstack/react-table";
import type * as React from "react";
import { DataTablePagination } from "./data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "./lib/data-table";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  totalRowCount?: number; // Total row count for manual pagination (overrides table.getRowCount())
  paginationData?: { // Optional pagination object for manual pagination
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  pinned?: {
    withBorder?: boolean
  },
  isStickyHeader?: boolean; // Show/hide sticky header
  showSideBorders?: boolean; // Show/hide table side borders
  showZebraStriping?: boolean; // Show/hide zebra striping
  zebraStripingClassName?: string; // Custom class for zebra striping
  styles?: {
    container?: {
      default?: string,
    }
    TableHeader?: {
      default?: string,
    }
    TableHead?: {
      default?: string,
    }
    TableCell?: {
      default?: string,
    }
  },
  defaultNoResultText?: string;
}

type RowNumberColumnDef<T> = ColumnDef<T> & {
  id?: string;
  accessorKey?: string;
  header?: string;
  size?: number;
  enableResizing?: boolean;
  enableSorting?: boolean;
  enableColumnFilter?: boolean;
  paginationData?: { // Optional pagination object for manual pagination
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  styles?: {
    header?: {
      default?: string;
    },
    cell?: {
      default?: string;
    }
  }
};

export function createRowNumberColumn<T>({ id = "__row_number__", accessorKey = "__row_number__", header = "No", size = 60,
  enableResizing = false, enableSorting = false,
  enableColumnFilter = false, paginationData, styles }: RowNumberColumnDef<T>): ColumnDef<T> {
  return {
    id: id,
    accessorKey: accessorKey,
    size: size,
    minSize: size,
    maxSize: size,
    enableResizing: enableResizing,
    enableSorting: enableSorting,
    enableColumnFilter: enableColumnFilter,
    header: ({ column }) => (
      <div className={cn("flex justify-center", styles?.header?.default)}>
        <DataTableColumnHeader column={column} title={header} />
      </div>
    ),
    cell: ({ row, table }) => {
      return (
        <div className={cn("flex justify-center", styles?.cell?.default)}>
          {paginationData
            ? (paginationData.page - 1) * paginationData.limit + row.index + 1
            : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1
          }
        </div>
      )
    },
    meta: {
      label: "No",
    }
  }
}

type RowSelectColumnDef = {
  id?: string;
  size?: number;
  enableSorting?: boolean;
  enableHiding?: boolean;
  styles?: {
    header?: {
      default?: string;
    },
    cell?: {
      default?: string;
    }
  }
};

export function createRowSelectColumn<T>({
  id = "select",
  size = 40,
  enableSorting = false,
  enableHiding = false,
  styles
}: RowSelectColumnDef = {}): ColumnDef<T> {
  return {
    id: id,
    size: size,
    minSize: size,
    maxSize: size,
    enableSorting: enableSorting,
    enableHiding: enableHiding,
    header: ({ table }: any) => (
      <div className={cn("flex items-center justify-center", styles?.header?.default)}>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }: any) => (
      <div className={cn("flex items-center justify-center", styles?.cell?.default)}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    meta: {
      label: "Select",
    }
  }
}

export function DataTable<TData>({
  table,
  actionBar,
  children,
  className,
  pageSizeOptions,
  totalRowCount,
  paginationData,
  pinned,
  isStickyHeader = true,
  showSideBorders = true,
  showZebraStriping = false,
  zebraStripingClassName,
  styles,
  defaultNoResultText = "No result found",
  ...props
}: DataTableProps<TData> & { pageSizeOptions?: number[] }) {
  const rowLength = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div
      className={cn("flex w-full flex-col gap-4 overflow-hidden", "[&_td]:align-center", className)}
      {...props}
    >
      {children}
      <div className={cn(
        "w-full overflow-hidden",
        isStickyHeader ? "[&>div]:max-h-[80vh]" : "",
        !showSideBorders && "[&>div]:overflow-x-hidden",
        styles?.container?.default
      )}>
        <Table className="border-separate border-spacing-0 border-none"
          style={{
            // width: table.getCenterTotalSize(),
          }}
        >
          <TableHeader className={cn("w-full", isStickyHeader ? "sticky top-0 z-10 backdrop-blur-xs" : "", styles?.TableHeader?.default)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="">
                {headerGroup.headers.map((header: Header<TData, any>) => {
                  return (
                    <TableHead
                      className={cn(
                        "bg-[#fafafa]/85 dark:bg-[#28313e]/85 py-0 px-2 relative group",
                        "border-b border-r border-t",
                        showSideBorders ? "first:border-l" : "first:border-l-0",
                        !showSideBorders && "last:border-r-0",
                        styles?.TableHead?.default
                      )}
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...getCommonPinningStyles({ column: header.column, withBorder: pinned?.withBorder ?? true }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                      {header.column.getCanResize() && (
                        <div
                          {...{
                            onDoubleClick: () => header.column.resetSize(),
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className:
                              "absolute top-0 h-full w-0 cursor-col-resize user-select-none touch-none -right-0 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:translate-x-px",
                          }}
                        />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="w-full"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "border-b border-r py-1 px-2",
                        showZebraStriping ? (index % 2 === 0 ? "" : (zebraStripingClassName || "bg-muted/30")) : "",
                        showSideBorders ? "first:border-l" : "first:border-l-0",
                        !showSideBorders && "last:border-r-0",
                        styles?.TableCell?.default
                      )}
                      style={{
                        ...getCommonPinningStyles({ column: cell.column, withBorder: pinned?.withBorder ?? true }),
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-15 text-center bg-secondary"
                >
                  {defaultNoResultText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <DataTablePagination
          pageIndex={table.getState().pagination.pageIndex}
          setPageIndex={table.setPageIndex}
          pageSize={table.getState().pagination.pageSize}
          setPageSize={table.setPageSize}
          rowsCount={totalRowCount ?? table.getRowCount()} // Use totalRowCount if provided for manual pagination
          pageSizeOptions={pageSizeOptions}
          paginationData={paginationData} // Pass pagination object for manual pagination
        />

        {(actionBar && (rowLength > 0)) && actionBar}
      </div>
    </div>
  );
}
