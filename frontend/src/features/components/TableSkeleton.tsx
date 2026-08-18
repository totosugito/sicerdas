import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  showSearch?: boolean;
}

export function TableSkeleton({
  columnCount = 6,
  rowCount = 5,
  showSearch = true,
}: TableSkeletonProps) {
  return (
    <Card className="overflow-hidden">
      {showSearch && (
        <div className="flex flex-col sm:flex-row justify-end p-4 bg-muted/30 border-b border-border space-y-0">
          <div className="flex flex-row gap-2 w-full sm:max-w-sm">
            {/* Search Input skeleton */}
            <div className="h-9 w-full rounded-md border bg-background/50 flex items-center px-3">
              <Skeleton className="h-4 w-28 bg-muted-foreground/10" />
            </div>
          </div>
        </div>
      )}
      <CardContent className="p-0">
        <div className="w-full overflow-hidden">
          <Table className="border-separate border-spacing-0 border-none w-full">
            <TableHeader className="w-full">
              <TableRow>
                {[...Array(columnCount)].map((_, i) => (
                  <TableHead
                    key={i}
                    className="bg-[#fafafa]/85 dark:bg-[#28313e]/85 py-3 px-4 border-b border-r border-t first:border-l-0 last:border-r-0"
                  >
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(rowCount)].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {[...Array(columnCount)].map((_, j) => (
                    <TableCell
                      key={j}
                      className="py-4 px-4 border-b border-r first:border-l-0 last:border-r-0"
                    >
                      <Skeleton className="h-4 w-3/4 max-w-[200px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
