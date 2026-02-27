"use client";

import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const canSort = column.getCanSort();
  const isSorted = column.getIsSorted();

  const handleSort = (direction: 'asc' | 'desc' | 'toggle') => {
    if (direction === 'toggle') {
      // Toggle through sort states: asc <-> desc
      if (isSorted !== 'asc') {
        column.toggleSorting(false); // Enable asc
      } else {
        column.toggleSorting(true); // Enable desc
      }
    } else {
      column.toggleSorting(direction === 'desc');
    }
    setIsOpen(false);
  };

  const minSize = column.columnDef.minSize;
  const maxSize = column.columnDef.maxSize;

  const style: React.CSSProperties = {
    minWidth: minSize ? `${minSize}px` : undefined,
    maxWidth: maxSize ? `${maxSize}px` : undefined,
  };

  if (!canSort) {
    return <div className={cn("flex items-center", className)} style={style}>{title}</div>;
  }

  return (
    <div
      className={cn("group flex items-center space-x-1 cursor-pointer select-none hover:text-foreground transition-colors w-full min-w-0", className)}
      style={style}
      onClick={() => handleSort('toggle')}
    >
      <span className="group-hover:text-foreground break-words leading-tight flex-1">{title}</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 group-hover:text-foreground data-[state=open]:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isSorted === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : isSorted === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-1" align="start" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-y-1">
            <Button
              variant="ghost"
              size="sm"
              className={`justify-start ${isSorted === 'asc' ? 'bg-accent' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSort('asc');
              }}
            >
              <ChevronUp className="mr-2 h-4 w-4" />
              Sort A → Z
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`justify-start ${isSorted === 'desc' ? 'bg-accent' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSort('desc');
              }}
            >
              <ChevronDown className="mr-2 h-4 w-4" />
              Sort Z → A
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}