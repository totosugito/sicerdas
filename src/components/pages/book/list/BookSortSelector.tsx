import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BookSortSelectorProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export const BookSortSelector = ({
  sortBy,
  sortOrder,
  onSortChange
}: BookSortSelectorProps) => {
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'createdAt', label: t('book.info.sort.createdAt') },
    { value: 'title', label: t('book.info.sort.title') },
    // { value: 'rating', label: t('book.info.sort.rating') },
    { value: 'viewCount', label: t('book.info.sort.viewCount') },
    // { value: 'downloadCount', label: t('book.info.sort.downloadCount') },
  ];

  const handleSortFieldChange = (value: string) => {
    onSortChange(value, sortOrder);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={handleSortFieldChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t('book.info.sort.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
        className="h-8 w-8 p-0"
      >
        {sortOrder === 'asc' ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};