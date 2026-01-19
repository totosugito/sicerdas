import { useCallback, useMemo } from 'react';
import { FilterParamCategory } from '@/service/book/book';
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

  const activeCategoryId = selectedFilters.categories[0];
  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const displayedGroups = activeCategory ? activeCategory.groups : [];

  // Derive grades based on active category
  const { grades, gradesGridClass } = useMemo(() => {
    if (!activeCategoryId) return { grades: [], gradesGridClass: '' };

    if ([1, 2, 3].includes(activeCategoryId)) {
      return {
        grades: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, label: (i + 1).toString() })),
        gradesGridClass: 'grid-cols-4'
      };
    }

    if (activeCategoryId === 5) {
      return {
        grades: [16, 17, 18, 19].map(g => ({ id: g, label: `Level ${g - 15}` })),
        gradesGridClass: 'grid-cols-2'
      };
    }

    return { grades: [], gradesGridClass: '' };
  }, [activeCategoryId]);

  const handleCategoryChange = useCallback((value: string) => {
    onFilterChange({
      categories: [parseInt(value)],
      groups: [],
      grades: []
    });
  }, [onFilterChange]);

  const toggleGroup = useCallback((groupId: number, checked: boolean) => {
    const newGroups = checked
      ? [...selectedFilters.groups, groupId]
      : selectedFilters.groups.filter(g => g !== groupId);

    let newCategories = [...selectedFilters.categories];

    // If checking a group, ensure its parent category is selected
    if (checked) {
      const parentCat = categories.find(c => c.groups.some(g => g.id === groupId));
      if (parentCat && !newCategories.includes(parentCat.id)) {
        newCategories = [parentCat.id];
      }
    }

    onFilterChange({
      ...selectedFilters,
      categories: newCategories,
      groups: newGroups
    });
  }, [categories, selectedFilters, onFilterChange]);

  const toggleGrade = useCallback((gradeId: number, checked: boolean) => {
    const currentGrades = selectedFilters.grades || [];
    const newGrades = checked
      ? [...currentGrades, gradeId]
      : currentGrades.filter(g => g !== gradeId);

    onFilterChange({
      ...selectedFilters,
      grades: newGrades
    });
  }, [selectedFilters, onFilterChange]);

  const clearSection = useCallback((key: 'groups' | 'grades') => {
    onFilterChange({
      ...selectedFilters,
      [key]: []
    });
  }, [selectedFilters, onFilterChange]);

  const renderSectionHeader = (title: string, hasSelection: boolean, onReset: () => void) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
        {title}
      </h3>
      {hasSelection && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-foreground transition-colors"
        >
          {t('books.info.reset')}
        </button>
      )}
    </div>
  );

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
            <CategoryOption value="0" id="cat-0" label={t('books.info.latest')} />
            {categories.map((category) => {
              const categoryTotal = category.groups.reduce((sum, g) => sum + (g.stats?.bookTotal || 0), 0);
              return (
                <CategoryOption
                  key={category.id}
                  value={category.id.toString()}
                  id={`cat-${category.id}`}
                  label={category.name}
                  count={categoryTotal}
                />
              );
            })}
          </RadioGroup>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

        {/* Groups */}
        {displayedGroups.length > 0 ? (
          <div>
            {renderSectionHeader(
              t('books.info.groups'),
              selectedFilters.groups.length > 0,
              () => clearSection('groups')
            )}
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
              {displayedGroups.map((group) => (
                <FilterCheckbox
                  key={group.id}
                  id={`group-${group.id}`}
                  label={group.name}
                  count={group.stats?.bookTotal}
                  checked={selectedFilters.groups.includes(group.id)}
                  onCheckedChange={(checked) => toggleGroup(group.id, checked)}
                  className="space-x-3"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic px-2 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-200 dark:border-slate-700">
            {t('books.info.select_category_to_view_groups')}
          </div>
        )}

        {/* Grades */}
        {grades.length > 0 && (
          <div>
            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-4" />
            {renderSectionHeader(
              t('books.info.grades'),
              (selectedFilters.grades?.length || 0) > 0,
              () => clearSection('grades')
            )}
            <div className={`grid ${gradesGridClass} gap-2 max-h-[200px] overflow-y-auto pr-2`}>
              {grades.map((grade) => (
                <FilterCheckbox
                  key={grade.id}
                  id={`grade-${grade.id}`}
                  label={grade.label}
                  checked={selectedFilters.grades?.includes(grade.id) || false}
                  onCheckedChange={(checked) => toggleGrade(grade.id, checked)}
                  className="space-x-2 p-1"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for cleaner render
const CategoryOption = ({ value, id, label, count }: { value: string, id: string, label: string, count?: number }) => (
  <div className="flex items-center space-x-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
    <RadioGroupItem value={value} id={id} />
    <Label htmlFor={id} className="flex-1 cursor-pointer font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white flex items-center">
      <span>{label}{count !== undefined && <span className="text-xs text-slate-400 font-normal ml-2">({count})</span>}</span>
    </Label>
  </div>
);

const FilterCheckbox = ({ id, label, count, checked, onCheckedChange, className = "" }: { id: string, label: string, count?: number, checked: boolean, onCheckedChange: (c: boolean) => void, className?: string }) => (
  <div className={`flex items-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${className}`}>
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(c) => onCheckedChange(c as boolean)}
    />
    <Label
      htmlFor={id}
      className="flex-1 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white flex items-center"
    >
      <span>{label}{count !== undefined && <span className="text-xs text-slate-400 font-normal ml-2">({count})</span>}</span>

    </Label>
  </div>
);