import { useCallback } from 'react';
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
  filterData?: {
    data: FilterParamCategory[];
  };
}

export const BookFilter = ({ selectedFilters, onFilterChange, filterData }: BookFilterProps) => {
  const { t } = useTranslation();
  const categories = filterData?.data || [];

  const handleCategoryChange = useCallback((value: string) => {
    const categoryId = parseInt(value);

    const category = categories.find(cat => cat.id === categoryId);
    const categoryGroups = category ? category.groups.map(g => g.id) : [];
    
    const newFilters = {
      categories: [categoryId],
      groups: categoryGroups
    };
    
    onFilterChange(newFilters);
  }, [categories, onFilterChange]);

  const toggleGroup = useCallback((groupId: number, checked: boolean) => {   
    let newCategories = [...selectedFilters.categories];
    let newGroups = [...selectedFilters.groups];

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
    
    onFilterChange(newFilters);
  }, [categories, selectedFilters, onFilterChange]);

  const activeCategoryId = selectedFilters.categories[0];
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
                const isChecked = selectedFilters.groups.includes(group.id);
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
    </div>
  );
};