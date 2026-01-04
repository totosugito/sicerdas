import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FilterParamCategory } from '@/service/book';
import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

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
  filterData?: {
    data: FilterParamCategory[];
  };
}

export const BookFilter = ({ selectedFilters, onFilterChange, autoSubmit = false, filterData }: BookFilterProps) => {
  const { t } = useTranslation();
  
  // Use ref to always have the current autoSubmit value
  const autoSubmitRef = useRef(autoSubmit);
  useEffect(() => {
    autoSubmitRef.current = autoSubmit;
  }, [autoSubmit]);

  // Use local state only when autoSubmit is false, otherwise use props as source of truth
  const [localFilters, setLocalFilters] = useState(() => {
    // Initialize local state based on autoSubmit prop
    return selectedFilters;
  });
  
  // Sync local state with props when autoSubmit is false
  useEffect(() => {
    console.log('Selected Filters:', selectedFilters, autoSubmit)
    if (!autoSubmit) {
      setLocalFilters(selectedFilters);
    }
  }, [selectedFilters, autoSubmit]);

  const categories = filterData?.data || [];

  const handleCategoryChange = useCallback((value: string) => {
    const categoryId = parseInt(value);

    const category = categories.find(cat => cat.id === categoryId);
    const categoryGroups = category ? category.groups.map(g => g.id) : [];
    
    const newFilters = {
      categories: [categoryId],
      groups: categoryGroups
    };
    
    const currentAutoSubmit = autoSubmitRef.current;
    console.log('New Filters:', newFilters, currentAutoSubmit)
    if (currentAutoSubmit) {
      onFilterChange(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  }, [categories, onFilterChange, autoSubmit, setLocalFilters]);

  const toggleGroup = useCallback((groupId: number, checked: boolean) => {
    // Use the appropriate filters based on autoSubmit
    const currentAutoSubmit = autoSubmitRef.current;
    const currentFilters = currentAutoSubmit ? selectedFilters : localFilters;
    
    let newCategories = [...currentFilters.categories];
    let newGroups = [...currentFilters.groups];

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
    
    if (currentAutoSubmit) {
      onFilterChange(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  }, [categories, selectedFilters, localFilters, onFilterChange, autoSubmit, setLocalFilters]);

  const applyFilters = useCallback(() => {
    const currentAutoSubmit = autoSubmitRef.current;
    const filtersToApply = currentAutoSubmit ? selectedFilters : localFilters;
    onFilterChange(filtersToApply);
  }, [autoSubmitRef, selectedFilters, localFilters, onFilterChange]);

  const currentFilters = autoSubmit ? selectedFilters : localFilters;
  const activeCategoryId = currentFilters.categories[0];
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
      </div>

      <div className="flex-1 space-y-6 mt-4 max-h-[80vh] overflow-y-auto">
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
                const currentFilters = autoSubmit ? selectedFilters : localFilters;
                const isChecked = currentFilters.groups.includes(group.id);
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
      {!autoSubmit && (
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={applyFilters} className="w-full">
            {t('books.info.apply_filters')}
          </Button>
        </div>
      )}

    </div>
  );
};