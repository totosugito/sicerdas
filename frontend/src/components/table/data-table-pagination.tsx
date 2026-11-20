import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectPositioner,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

interface DataTablePaginationProps extends React.ComponentProps<"div"> {
  pageIndex: number;
  setPageIndex: (pageIndex: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  rowsCount: number;
  pageSizeOptions?: number[];
  paginationData?: {
    // Optional pagination object for manual pagination
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  showPageSize?: boolean;
  showPageLabel?: boolean;
  disabled?: boolean;
  onPaginationChange?: (paginationData: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }) => void;
}

export function DataTablePagination({
  pageIndex,
  setPageIndex,
  pageSize,
  setPageSize,
  rowsCount,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  paginationData,
  showPageSize = true,
  disabled = false,
  onPaginationChange,
  showPageLabel = true,
  className,
}: DataTablePaginationProps) {
  const { t } = useAppTranslation();
  const maxDisplayedPages = 1; // Number of pages to show before and after the current page

  // Use pagination object data when available (for manual pagination)
  const currentPageIndex = paginationData ? paginationData.page - 1 : pageIndex; // Convert 1-based to 0-based
  const currentPageSize = paginationData ? paginationData.limit : pageSize;
  const totalRowsCount = paginationData ? paginationData.total : rowsCount;
  const pageCount = paginationData ? paginationData.totalPages : Math.ceil(rowsCount / pageSize);

  // Handle page changes
  const handlePageChange = (newPageIndex: number) => {
    if (paginationData && onPaginationChange) {
      // For manual pagination, use callback with pagination object
      onPaginationChange({
        page: newPageIndex + 1, // Convert 0-based to 1-based
        limit: currentPageSize,
        total: paginationData.total,
        totalPages: paginationData.totalPages,
      });
    } else {
      // For automatic pagination, use TanStack Table methods
      setPageIndex(newPageIndex);
    }
  };

  // Handle page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    if (paginationData && onPaginationChange) {
      // For manual pagination, use callback with pagination object
      onPaginationChange({
        page: 1, // Reset to first page when changing page size
        limit: newPageSize,
        total: paginationData.total,
        totalPages: Math.ceil(paginationData.total / newPageSize),
      });
    } else {
      // For automatic pagination, use TanStack Table methods
      setPageSize(newPageSize);
    }
  };

  const generatePageNumbers = (): number[] => {
    const pageNumbers_ = [];

    // Show pages before and after the current page index
    for (let i = 0; i < pageCount; i++) {
      pageNumbers_.push(i);
    }

    // Add ellipses when necessary
    const filteredPageNumbers = [];

    // set left pagination
    let idxLeftStart =
      currentPageIndex - maxDisplayedPages < 0 ? 0 : currentPageIndex - maxDisplayedPages;
    let addToTheRight =
      currentPageIndex - idxLeftStart < maxDisplayedPages
        ? maxDisplayedPages - (currentPageIndex - idxLeftStart)
        : 0;
    let idxRightPos = currentPageIndex + maxDisplayedPages + addToTheRight + 1;
    let idxLeftEnd = idxRightPos >= pageCount ? pageCount : idxRightPos;
    if (idxLeftEnd - idxLeftStart < maxDisplayedPages * 2 + 1) {
      idxLeftStart =
        idxLeftEnd - maxDisplayedPages * 2 - 1 < 0 ? 0 : idxLeftEnd - maxDisplayedPages * 2 - 1;
    }

    // --------------------------------------------------------------------------------
    // ADD PAGINATION
    // --------------------------------------------------------------------------------
    // add start pagination
    if (idxLeftStart > 0) {
      filteredPageNumbers.push(pageNumbers_[0]);
      if (idxLeftStart + 1 > 2) {
        filteredPageNumbers.push(-1);
      }
    }

    // add center pagination
    for (let j = idxLeftStart; j < idxLeftEnd; j++) {
      filteredPageNumbers.push(pageNumbers_[j]);
    }

    // add end pagination
    if (idxLeftEnd < pageCount) {
      if (idxLeftEnd < pageCount) {
        filteredPageNumbers.push(-1);
      }
      filteredPageNumbers.push(pageNumbers_[pageCount - 1]);
    }
    return filteredPageNumbers;
  };

  const pageNumbers = generatePageNumbers();
  let startIndex = currentPageSize * currentPageIndex + 1;
  if (startIndex > totalRowsCount) {
    startIndex = 1;
  }

  const endIndex = Math.min(startIndex + currentPageSize - 1, totalRowsCount);
  const totalPages = pageNumbers.length;

  return (
    <div
      className={cn(
        // wraps instead of overflowing: page numbers of a long list (e.g. "10.001") would otherwise push it sideways
        "flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-3",
        className,
      )}
    >
      <div>
        {showPageLabel && (
          <div className="flex items-center justify-center text-sm text-foreground">
            {t(($) => $.labels.row)} {(totalRowsCount > 0 ? startIndex : 0).toLocaleString("id-ID")}
            <span className={"text-foreground px-[2px]"}>–</span>
            {endIndex.toLocaleString("id-ID")}
            <span className={"text-foreground px-[2px]"}>{t(($) => $.labels.of)}</span>
            {totalRowsCount.toLocaleString("id-ID")}
          </div>
        )}
      </div>

      {totalRowsCount >= (pageSizeOptions?.[0] ?? 5) && (
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          {showPageSize && (
            <div className="flex items-center space-x-2">
              <Select
                value={`${currentPageSize}`}
                onValueChange={(value) => {
                  handlePageSizeChange(Number(value));
                }}
              >
                <SelectTrigger className="w-auto min-w-[8.3rem]">
                  <SelectValue placeholder={String(currentPageSize)}>
                    {`${currentPageSize} ${t(($) => $.labels.pagination.rowsPerPage)}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectPositioner side="top">
                  <SelectContent>
                    {pageSizeOptions.map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize} {t(($) => $.labels.pagination.rowsPerPage)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectPositioner>
              </Select>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="inline-flex gap-0 -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
                {pageNumbers.map((page: number, index: number) => (
                  <PaginationItem
                    key={index}
                    className="[&:first-child>a]:rounded-s-md [&:last-child>a]:rounded-e-md"
                  >
                    {page < 0 ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        // className="rounded-none shadow-none focus-visible:z-10 aria-disabled:pointer-events-none [&[aria-disabled]>svg]:opacity-50"
                        isActive={currentPageIndex === page}
                        onClick={() => {
                          if (disabled) {
                            return;
                          }
                          handlePageChange(page);
                        }}
                      >
                        {(page + 1).toLocaleString("id-ID")}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
