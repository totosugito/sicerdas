"use client";

import type { Table } from "@tanstack/react-table";
import { Check, ChevronsUpDown, Filter } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ColumnMeta } from "./types/types";

// 🔑 custom filterFn (OR logic)
const multiSelectFilter = (row: any, columnId: string, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const cellValue = row.getValue(columnId);
  return filterValue.includes(cellValue);
};

interface DataTableViewUniqueProps<TData> {
  table: Table<TData>;
  columnId: string;
  title?: string;
}

export function DataTableViewUnique<TData>({
  table,
  columnId,
  title,
}: DataTableViewUniqueProps<TData>) {
  const [open, setOpen] = React.useState(false);

  // Get unique values
  const uniqueValues = React.useMemo(() => {
    const column = table.getColumn(columnId);
    if (!column) return [];
    const values = Array.from(column.getFacetedUniqueValues().keys());
    return values.sort();
  }, [table.getColumn(columnId)?.getFacetedUniqueValues()]);

  // Get counts for each value
  const valueCounts = React.useMemo(() => {
    const column = table.getColumn(columnId);
    if (!column) return new Map();
    return column.getFacetedUniqueValues();
  }, [table.getColumn(columnId)?.getFacetedUniqueValues()]);

  const selectedValues = React.useMemo(() => {
    const filterValue = table.getColumn(columnId)?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn(columnId)?.getFilterValue()]);

  const handleValueChange = (checked: boolean, value: string) => {
    const column = table.getColumn(columnId);
    if (!column) return;

    const filterValue = (column.getFilterValue() as string[]) ?? [];
    const newFilterValue = [...filterValue];

    if (checked) {
      if (!newFilterValue.includes(value)) newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    // ✅ ensure column uses multiSelect filterFn
    if (typeof column.columnDef.filterFn !== "function") {
      column.columnDef.filterFn = multiSelectFilter;
    }

    column.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  // Clear all selected values
  const clearAllValues = () => {
    const column = table.getColumn(columnId);
    if (!column) return;
    column.setFilterValue(undefined);
  };

  // Get column meta for display
  const columnMeta = React.useMemo(() => {
    const column = table.getColumn(columnId);
    return column?.columnDef.meta as ColumnMeta<TData> | undefined;
  }, [table, columnId]);

  const displayTitle = title || columnMeta?.label || columnId;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          <Filter className="mr-2 h-4 w-4" />
          {displayTitle}
          {selectedValues.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedValues.length}
            </Badge>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-36 max-w-56 p-2" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {uniqueValues.map((value) => {
                const isSelected = selectedValues.includes(value as string);
                const count = valueCounts.get(value) || 0;

                return (
                  <CommandItem
                    key={value}
                    value={String(value)}
                    onSelect={() => {
                      handleValueChange(!isSelected, String(value));
                    }}
                    className="justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded border border-primary",
                          isSelected
                            ? "bg-primary"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="truncate">
                        {value === null || value === undefined || value === ""
                          ? "(Empty)"
                          : String(value)}
                      </span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selectedValues.length > 0 && (
            <div className="border-t pt-1 px-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={clearAllValues}
              >
                Clear Filter
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
