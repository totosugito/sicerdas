"use client";

import type { Table } from "@tanstack/react-table";
import { CheckCircle2, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DataTableSelectionProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  onSelectionChange?: (selectedData: TData[]) => void;
  showClearButton?: boolean;
  selectionText?: {
    single?: string;
    multiple?: string;
    none?: string;
  };
}

export function DataTableSelection<TData>({
  table,
  children,
  className,
  onSelectionChange,
  showClearButton = true,
  selectionText = {
    single: "item selected",
    multiple: "items selected",
    none: "No items selected"
  },
  ...props
}: DataTableSelectionProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedData = selectedRows.map(row => row.original);

  // Call the callback when selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedData);
    }
  }, [selectedData, onSelectionChange]);

  const handleClearSelection = React.useCallback(() => {
    table.resetRowSelection();
  }, [table]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md bg-muted/50 p-3 border",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            {selectedCount}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {selectedCount === 1 
              ? selectionText.single 
              : selectionText.multiple
            }
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Custom action buttons from children */}
        {React.Children.count(children) > 0 && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
        
        {/* Clear selection button */}
        {showClearButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            className="h-8 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}