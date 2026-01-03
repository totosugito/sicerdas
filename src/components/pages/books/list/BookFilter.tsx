import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FilterParamCategory, useBookFilterParams } from '@/service/book';
import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface BookFilterProps {
  selectedFilters: {
    categories: number[];
    groups: number[];
  };
  onFilterChange: (filters: {
    categories: number[];
    groups: number[];
  }) => void;
  autoSubmit?: boolean;
  onAutoSubmitChange?: (enabled: boolean) => void;
}

export const BookFilter = ({ selectedFilters, onFilterChange, autoSubmit = false, onAutoSubmitChange }: BookFilterProps) => {
  const { t } = useTranslation();
  const { data: filterParamsData, isLoading, isError } = useBookFilterParams();

  // Local state for deferred submission
  const [localFilters, setLocalFilters] = useState(selectedFilters);

  // Sync with props when they change (e.g. navigation / external reset)
  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  // Apply filters immediately when autoSubmit is enabled
  useEffect(() => {
    if (autoSubmit) {
      onFilterChange(localFilters);
    }
  }, [localFilters, autoSubmit, onFilterChange]);

  const categories = filterParamsData?.data || [];

  const handleCategoryChange = (value: string) => {
    const categoryId = parseInt(value);

    const category = categories.find(cat => cat.id === categoryId);
    const categoryGroups = category ? category.groups.map(g => g.id) : [];
    
    const newFilters = {
      categories: [categoryId],
      groups: categoryGroups
    };
    
    if (autoSubmit) {
      onFilterChange(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  };

  const toggleGroup = (groupId: number, checked: boolean) => {
    let newCategories = [...localFilters.categories];
    let newGroups = [...localFilters.groups];

    if (checked) {
      newGroups.push(groupId);
      const parentCat = categories.find(c => c.groups.some(g => g.id === groupId));
      if (parentCat && !newCategories.includes(parentCat.id)) {
        newCategories = [parentCat.id];
      }
    } else {
      newGroups = newGroups.filter(g => g !== groupId);
    }

    const newFilters = {
      categories: newCategories,
      groups: newGroups
    };
    
    if (autoSubmit) {
      onFilterChange(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  };

  const clearFilters = () => {
    const emptyFilters = { categories: [], groups: [] };
    
    if (autoSubmit) {
      onFilterChange(emptyFilters);
    } else {
      setLocalFilters(emptyFilters);
    }
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  // Only show apply button when autoSubmit is disabled
  const showApplyButton = !autoSubmit;

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>;
  if (isError) return <div className="text-red-500">Error loading filters</div>;

  const activeCategoryId = localFilters.categories[0];
  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const displayedGroups = activeCategory ? activeCategory.groups : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          {t('books.info.filters')}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-submit"
              checked={autoSubmit}
              onCheckedChange={(checked) => onAutoSubmitChange?.(checked)}
              aria-label="Auto-submit filters"
            />
            <Label htmlFor="auto-submit" className="text-xs text-slate-600 dark:text-slate-400">
              {t('books.info.auto_apply')}
            </Label>
          </div>
          {(localFilters.categories.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7 px-3 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              {t('books.info.reset')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-6 mt-4">
        {/* Categories */}
        <div className=''>
          <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            {t('books.info.categories')}
          </h3>
          <RadioGroup
            value={activeCategoryId?.toString() || ""}
            onValueChange={handleCategoryChange}
            className="space-y-1"
          >
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <RadioGroupItem value={category.id.toString()} id={`cat-${category.id}`} />
                <Label htmlFor={`cat-${category.id}`} className="flex-1 cursor-pointer font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white">
                  {category.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

        {/* Groups */}
        {displayedGroups.length > 0 && (
          <div>
            <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              {t('books.info.groups')}
            </h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
              {displayedGroups.map((group) => {
                const isChecked = localFilters.groups.includes(group.id);
                return (
                  <div key={group.id} className="flex items-center space-x-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => toggleGroup(group.id, checked as boolean)}
                    />
                    <Label
                      htmlFor={`group-${group.id}`}
                      className="flex-1 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white"
                    >
                      {group.name}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {displayedGroups.length === 0 && (
          <div className="text-sm text-slate-400 italic px-2 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-200 dark:border-slate-700">
            {t('books.info.select_category_to_view_groups')}
          </div>
        )}
      </div>

      {/* Footer Action */}
      {showApplyButton && (
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={applyFilters} className="w-full">
            {t('books.info.apply_filters')}
          </Button>
        </div>
      )}

    </div>
  );
};