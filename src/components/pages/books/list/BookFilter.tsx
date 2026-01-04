import { useCallback } from 'react';
import { FilterParamCategory } from '@/service/book';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface BookFilterProps {
  selectedFilters: {
    categories: number[];
    groups: number[];
    grades?: number[];
  };
  onFilterChange: (filters: {
    categories: number[];
    groups: number[];
    grades?: number[];
  }) => void;
  filterData?: {
    data: FilterParamCategory[];
  };
  autoSubmit?: boolean;
}

export const BookFilter = ({ selectedFilters, onFilterChange, filterData }: BookFilterProps) => {
  const { t } = useTranslation();
  const categories = filterData?.data || [];

  const handleCategoryChange = useCallback((value: string) => {
    const categoryId = parseInt(value);
    const newFilters = {
      categories: [categoryId],
      groups: [],
      grades: []
    };

    onFilterChange(newFilters);
  }, [categories, onFilterChange]);

  const toggleGroup = useCallback((groupId: number, checked: boolean) => {
    let newCategories = [...selectedFilters.categories];
    let newGroups = [...selectedFilters.groups];
    let newGrades = [...(selectedFilters.grades || [])];

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
      groups: newGroups,
      grades: newGrades
    };

    onFilterChange(newFilters);
  }, [categories, selectedFilters, onFilterChange]);

  const toggleGrade = useCallback((gradeId: number, checked: boolean) => {
    let newCategories = [...selectedFilters.categories];
    let newGroups = [...selectedFilters.groups];
    let newGrades = [...(selectedFilters.grades || [])];

    if (checked) {
      newGrades.push(gradeId);
    } else {
      newGrades = newGrades.filter(g => g !== gradeId);
    }

    const newFilters = {
      categories: newCategories,
      groups: newGroups,
      grades: newGrades
    };

    onFilterChange(newFilters);
  }, [selectedFilters, onFilterChange]);

  const clearGrades = useCallback(() => {
    const newFilters = {
      categories: [...selectedFilters.categories],
      groups: [...selectedFilters.groups],
      grades: []
    };

    onFilterChange(newFilters);
  }, [selectedFilters, onFilterChange]);

  const clearGroups = useCallback(() => {
    const newFilters = {
      categories: [...selectedFilters.categories],
      groups: [],
      grades: [...(selectedFilters.grades || [])]
    };

    onFilterChange(newFilters);
  }, [selectedFilters, onFilterChange]);

  const activeCategoryId = selectedFilters.categories[0];
  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const displayedGroups = activeCategory ? activeCategory.groups : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
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
            <div className="flex items-center space-x-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RadioGroupItem value={"0"} id={`cat-0`} />
              <Label htmlFor={`cat-0`} className="flex-1 cursor-pointer font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white">
                {t('books.info.latest')}
              </Label>
            </div>

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

        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
        {/* Groups */}
        {displayedGroups.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                {t('books.info.groups')}
              </h3>
              {selectedFilters.groups.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-foreground transition-colors"
                  onClick={() => clearGroups()}
                >
                  {t('books.info.reset')}
                </button>
              )}
            </div>
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

        {/* Grades - Only show for categories 1, 2, 3 */}
        {selectedFilters.categories.length > 0 &&
          [1, 2, 3].some(cat => selectedFilters.categories.includes(cat)) && (
            <div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              <div className="flex items-center justify-between my-4">
                <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  {t('books.info.grades')}
                </h3>
                {selectedFilters.grades && selectedFilters.grades.length > 0 && (
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-foreground transition-colors"
                    onClick={() => clearGrades()}
                  >
                    {t('books.info.reset')}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => {
                  const isChecked = selectedFilters.grades?.includes(grade) || false;
                  return (
                    <div key={grade} className="flex items-center space-x-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors p-1">
                      <Checkbox
                        id={`grade-${grade}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => toggleGrade(grade, checked as boolean)}
                      />
                      <Label
                        htmlFor={`grade-${grade}`}
                        className="text-sm font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white cursor-pointer"
                      >
                        {grade}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};