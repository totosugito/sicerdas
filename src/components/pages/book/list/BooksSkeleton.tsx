import {cn} from "@/lib/utils";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {EnumViewMode} from "@/constants/app-enum";

export const BooksSkeleton = ({viewMode, length = 8}: {
  viewMode: (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"],
  length?: number
}) => {
  return (
    <div className={cn(
      viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4"
    )}>
      {Array.from({length: length}).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-3/4"/>
            <Skeleton className="h-3 w-1/2"/>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-4"/>
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16"/>
              <Skeleton className="h-6 w-20"/>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}