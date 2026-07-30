import { ListPassagesResponse, ExamPassage } from "@/api/exam/passages";
import { PassageCardListItem } from "./PassageCardListItem";
import { PaginationData } from "@/components/table";
import { useAppTranslation } from "@/lib/i18n-typed";
import { BookOpen } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { CardListSkeleton } from "@/features/components";
import { EmptyState } from "@/components/general";

interface PassageCardListProps {
  data: ListPassagesResponse | undefined;
  isLoading: boolean;
  paginationData: PaginationData | undefined;
  onDelete: (passage: ExamPassage) => void;
}

export function PassageCardList({ data, isLoading, onDelete }: PassageCardListProps) {
  const { t } = useAppTranslation();
  const { openSideMenu } = useAuthStore();

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (isLoading) {
    return <CardListSkeleton />;
  }

  const items = data?.data.items || [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t(($) => $.exam.passages.table.noResult)}
        description={t(($) => $.exam.passages.table.noData)}
      />
    );
  }

  return (
    <div className={cn(gridClass)}>
      {items.map((passage) => (
        <PassageCardListItem key={passage.id} passage={passage} onDelete={onDelete} />
      ))}
    </div>
  );
}
