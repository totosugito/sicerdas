import {
  ColumnFiltersState,
  ColumnVisibilityState,
  columnFacetingFeature,
  columnFilteringFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  ExpandedState,
  PaginationState,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  RowSelectionState,
  rowSortingFeature,
  SortingState,
  TableOptions,
  TableState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useState } from "react";

import type { TableFeatures, RowData } from "@tanstack/react-table";

interface UseDataTableProps<TData extends RowData = any>
  extends Omit<
    TableOptions<TableFeatures, TData>,
    | "state"
    | "pageCount"
    | "features"
    | "getSubRows"
  >,
  Required<Pick<TableOptions<TableFeatures, TData>, "pageCount">> {
  getSubRows?: (row: TData) => TData[] | undefined;
  initialState?: Omit<Partial<TableState<TableFeatures>>, "columnFilters"> & {};
}

export const defaultFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnPinningFeature,
  columnFacetingFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowExpandingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
});

export type TableFeaturesType = typeof defaultFeatures;

export function useDataTable<TData extends RowData = any>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    manualSorting = false,
    manualFiltering = false,
    manualPagination = false,
    manualExpanding = false,
    onSortingChange,
    onPaginationChange,
    onColumnFiltersChange,
    onExpandedChange,
    getSubRows,
    columnResizeMode = "onChange",
    ...tableProps
  } = props;
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState?.rowSelection ?? {},
  );
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>(
    initialState?.columnVisibility ?? {}
  );

  const [sorting, setSorting] = React.useState<SortingState>(initialState?.sorting ?? []);
  const [pagination, setPagination] = React.useState<PaginationState>(
    initialState?.pagination ?? {
      pageIndex: 0,
      pageSize: 10,
    }
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>(initialState?.expanded ?? {});

  React.useEffect(() => {
    if (initialState?.pagination) {
      setPagination((prev) => {
        const nextPageIndex = initialState.pagination?.pageIndex ?? prev.pageIndex;
        const nextPageSize = initialState.pagination?.pageSize ?? prev.pageSize;
        if (prev.pageIndex !== nextPageIndex || prev.pageSize !== nextPageSize) {
          return { pageIndex: nextPageIndex, pageSize: nextPageSize };
        }
        return prev;
      });
    }
  }, [initialState?.pagination?.pageIndex, initialState?.pagination?.pageSize]);

  React.useEffect(() => {
    if (initialState?.sorting) {
      setSorting((prev) => {
        const next = initialState.sorting!;
        if (prev.length !== next.length) return next;
        const isSame = prev.every((v, index) => v.id === next[index].id && v.desc === next[index].desc);
        return isSame ? prev : next;
      });
    }
  }, [initialState?.sorting]);

  const handleSortingChange = manualSorting ? onSortingChange : setSorting;
  const handlePaginationChange = manualPagination ? onPaginationChange : setPagination;
  const handleColumnFiltersChange = manualFiltering ? onColumnFiltersChange : setColumnFilters;
  const handleExpandedChange = manualExpanding ? onExpandedChange : setExpanded;

  const table = useTable({
    ...tableProps,
    features: defaultFeatures,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      expanded,
    },
    getSubRows: getSubRows || ((row: any) => row?.subRows),
    onExpandedChange: handleExpandedChange,

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: manualPagination,
    manualSorting: manualSorting,
    manualFiltering: manualFiltering,
    manualExpanding: manualExpanding,

    columnResizeMode: columnResizeMode,
    meta: {
      ...(tableProps.meta ?? {}),
    },
  });

  return { table };
}