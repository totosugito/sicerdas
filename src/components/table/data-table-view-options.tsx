"use client";

import type { Table, TableFeatures, RowData } from "@tanstack/react-table";
import { Check, ChevronsUpDown, Columns3 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import type { ColumnMeta } from "./types/types";

interface DataTableViewOptionsProps<TData extends RowData = any> {
  table: Table<TableFeatures, TData>;
  visibleColumns?: string[];
  onApply?: (visibleColumns: string[]) => void;
}

export function DataTableViewOptions<TData extends RowData = any>({
  table,
  visibleColumns,
  onApply,
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const [pendingVisibility, setPendingVisibility] = React.useState<Record<string, boolean>>({});

  const columns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter(
        (column) =>
          typeof column.accessorFn !== "undefined" && column.getCanHide()
      );
  }, [table]);

  React.useEffect(() => {
    if (open) {
      const initial: Record<string, boolean> = {};
      columns.forEach((col) => {
        initial[col.id] = col.getIsVisible();
      });
      setPendingVisibility(initial);
    }
  }, [open, columns]);

  const activeCount = React.useMemo(() => {
    return Object.values(pendingVisibility).filter(Boolean).length;
  }, [pendingVisibility]);

  const toggleColumn = (columnId: string) => {
    setPendingVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleApply = () => {
    Object.entries(pendingVisibility).forEach(([columnId, isVisible]) => {
      const column = table.getColumn(columnId);
      if (column) {
        column.toggleVisibility(isVisible);
      }
    });

    if (onApply) {
      const appliedVisibleColumnIds = Object.entries(pendingVisibility)
        .filter(([_, isVisible]) => isVisible)
        .map(([columnId]) => columnId);
      onApply(appliedVisibleColumnIds);
    }

    setOpen(false);
  };

  const handleReset = () => {
    const defaultVis: Record<string, boolean> = {};
    columns.forEach((col) => {
      const meta = col.columnDef.meta as ColumnMeta<TData> | undefined;
      defaultVis[col.id] = meta?.initialVisible ?? true;
    });
    setPendingVisibility(defaultVis);
  };

  const handleToggleAll = (select: boolean) => {
    const nextVis: Record<string, boolean> = {};
    columns.forEach((col) => {
      nextVis[col.id] = select;
    });
    setPendingVisibility(nextVis);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-9 lg:flex gap-2"
          >
            <Columns3 className="h-4 w-4" />
            Display
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          </Button>
        }
      />
      <PopoverPositioner align="end">
        <PopoverContent className="w-[260px] p-0">
          <Command>
            <div className="p-2 pb-0">
              <CommandInput placeholder="Search columns..." className="h-8" />
            </div>

            <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
              <span>{activeCount} of {columns.length} active</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAll(true)}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleToggleAll(false)}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <Separator />

            <CommandList className="max-h-[240px]">
              <CommandEmpty>No columns found.</CommandEmpty>
              <CommandGroup>
                {columns.map((column) => {
                  const meta = column.columnDef.meta as ColumnMeta<TData> | undefined;
                  const label = meta?.label || column.id;
                  const isChecked = pendingVisibility[column.id] ?? column.getIsVisible();

                  return (
                    <CommandItem
                      key={column.id}
                      onSelect={() => toggleColumn(column.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-xs border border-primary transition-colors",
                            isChecked
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:hidden"
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="truncate">{label}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>

            <Separator />

            <div className="p-2 flex items-center justify-between gap-2 bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="h-8 text-xs px-3"
              >
                Apply
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
}
