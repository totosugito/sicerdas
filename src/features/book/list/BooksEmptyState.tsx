import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";

interface BooksEmptyStateProps {
  searchTerm: string;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export const BooksEmptyState = ({
  searchTerm,
  hasActiveFilters,
  onReset,
}: BooksEmptyStateProps) => {
  const { t } = useAppTranslation();

  return (
    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <BookOpen className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        {t(($) => $.book.noBooksFound)}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
        {searchTerm
          ? `${t(($) => $.book.noSearchResults)} "${searchTerm}"`
          : t(($) => $.book.noBooksAvailable)}
      </p>
      {(searchTerm || hasActiveFilters) && (
        <Button variant="outline" onClick={onReset}>
          {t(($) => $.book.clearSearch)}
        </Button>
      )}
    </div>
  );
};
