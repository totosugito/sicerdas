"use client";

import type { Table, TableFeatures, RowData } from "@tanstack/react-table";
import { Check, Filter } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export const filterUniqueFn = (row: any, columnId: string, filterValue: any[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const cellValue = row.getValue(columnId);
  return filterValue.includes(cellValue);
};

interface DataTableViewUniqueProps<TData extends RowData = any> {
  table: Table<TableFeatures, TData>;
  columnId: string;
  title?: string;
}

export function DataTableViewUnique<TData extends RowData = any>({
  table,
  columnId,
  title,
}: DataTableViewUniqueProps<TData>) {
  const column = table.getColumn(columnId);
  const [open, setOpen] = React.useState(false);

  if (!column) {
    return null;
  }

  const facetedUniqueValues = column.getFacetedUniqueValues();
  const options = React.useMemo(() => {
    if (!facetedUniqueValues) return [];
    return Array.from(facetedUniqueValues.keys())
      .filter((val) => val != null && val !== "")
      .sort();
  }, [facetedUniqueValues]);

  const selectedValues = new Set((column.getFilterValue() as string[]) || []);

  const handleSelect = (value: string) => {
    const nextValues = new Set(selectedValues);
    if (nextValues.has(value)) {
      nextValues.delete(value);
    } else {
      nextValues.add(value);
    }

    const filterValue = Array.from(nextValues);
    column.setFilterValue(filterValue.length ? filterValue : undefined);
  };

  const handleClear = () => {
    column.setFilterValue(undefined);
  };

  const displayTitle = title || column.id;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-dashed flex items-center gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{displayTitle}</span>
            {selectedValues.size > 0 && (
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
            )}
            {selectedValues.size > 0 && (
              <div className="hidden space-x-1 lg:flex">
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {selectedValues.size} selected
                </Badge>
              </div>
            )}
          </Button>
        }
      />
      <PopoverPositioner align="start">
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={displayTitle} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.has(option);
                  const count = facetedUniqueValues?.get(option) || 0;

                  return (
                    <CommandItem
                      key={option}
                      onSelect={() => handleSelect(option)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:hidden"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="flex-1 truncate">{option}</span>
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs text-muted-foreground">
                        {count}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedValues.size > 0 && (
                <>
                  <div className="p-1 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="w-full justify-center text-xs h-8"
                    >
                      Clear filters
                    </Button>
                  </div>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
}
