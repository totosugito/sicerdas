import { ExamPackage, ListPackagesResponse } from "@/api/exam/packages";
import { PaginationData } from "@/components/table";
import { PackageCardListItem } from "./PackageCardListItem";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PackageOpen } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { CardListSkeleton } from "@/features/components";
import { EmptyState } from "@/components/general";

interface PackageCardListProps {
  data: ListPackagesResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  onDelete: (pkg: ExamPackage) => void;
  onClone?: (pkg: ExamPackage) => void;
}

export function PackageCardList({
  data,
  isLoading,
  paginationData,
  onPaginationChange,
  onDelete,
  onClone,
}: PackageCardListProps) {
  const { t } = useAppTranslation();
  const { openSideMenu } = useAuthStore();
  const items = data?.data?.items || [];

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (isLoading) {
    return <CardListSkeleton count={paginationData?.limit || 8} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={t(($) => $.exam.packages.table.noResult)}
        description={t(($) => $.exam.packages.description)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={cn(gridClass)}>
        {items.map((pkg) => (
          <PackageCardListItem key={pkg.id} pkg={pkg} onDelete={onDelete} onClone={onClone} />
        ))}
      </div>
    </div>
  );
}
