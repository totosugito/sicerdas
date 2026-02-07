import { useCallback, useMemo } from 'react';
import { FilterParamCategory } from '@/api/book/book';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

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
  idPrefix?: string;
}

export const BookFilter = ({ selectedFilters, onFilterChange, filterData, autoSubmit = true, idPrefix = 'filter' }: BookFilterProps) => {
  const { t } = useTranslation();
  const categories = filterData?.data || [];

  const [localFilters, setLocalFilters] = useState(selectedFilters);

  // Sync with prop changes, but only if they are meaningfully different from committed state
  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  const activeCategoryId = localFilters.categories[0];
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

  const updateFilters = useCallback((newFilters: typeof selectedFilters) => {
    setLocalFilters(newFilters);
    // console.log('BookFilter updateFilters', { autoSubmit, newFilters });
    if (autoSubmit) {
      onFilterChange(newFilters);
    }
  }, [autoSubmit, onFilterChange]);

  const handleCategoryChange = useCallback((value: string) => {
    updateFilters({
      categories: [parseInt(value)],
      groups: [],
      grades: []
    });
  }, [updateFilters]);

  const toggleGroup = useCallback((groupId: number, checked: boolean) => {
    const newGroups = checked
      ? [...localFilters.groups, groupId]
      : localFilters.groups.filter(g => g !== groupId);

    let newCategories = [...localFilters.categories];

    // If checking a group, ensure its parent category is selected
    if (checked) {
      const parentCat = categories.find(c => c.groups.some(g => g.id === groupId));
      if (parentCat && !newCategories.includes(parentCat.id)) {
        newCategories = [parentCat.id];
      }
    }

    updateFilters({
      ...localFilters,
      categories: newCategories,
      groups: newGroups
    });
  }, [categories, localFilters, updateFilters]);

  const toggleGrade = useCallback((gradeId: number, checked: boolean) => {
    const currentGrades = localFilters.grades || [];
    const newGrades = checked
      ? [...currentGrades, gradeId]
      : currentGrades.filter(g => g !== gradeId);

    updateFilters({
      ...localFilters,
      grades: newGrades
    });
  }, [localFilters, updateFilters]);

  const clearSection = useCallback((key: 'groups' | 'grades') => {
    updateFilters({
      ...localFilters,
      [key]: []
    });
  }, [localFilters, updateFilters]);

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
          {t('book.info.reset')}
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
            {t('book.info.categories')}
          </h3>
          <RadioGroup
            value={activeCategoryId?.toString() || ""}
            onValueChange={handleCategoryChange}
            className="space-y-1"
          >
            <CategoryOption value="-1" id={`${idPrefix}-cat--1`} label={t('book.info.allBooks')} />
            <CategoryOption
              value="0"
              id={`${idPrefix}-cat-0`}
              label={t('book.info.latest')}
              subLabel={
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm">
                  {t('book.info.new')}
                </span>
              }
            />
            {categories.map((category) => {
              const categoryTotal = category.groups.reduce((sum, g) => sum + (g.stats?.bookTotal || 0), 0);
              return (
                <CategoryOption
                  key={category.id}
                  value={category.id.toString()}
                  id={`${idPrefix}-cat-${category.id}`}
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
              t('book.info.groups'),
              localFilters.groups.length > 0,
              () => clearSection('groups')
            )}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {displayedGroups.map((group) => (
                <FilterCheckbox
                  key={group.id}
                  id={`${idPrefix}-group-${group.id}`}
                  label={group.name}
                  count={group.stats?.bookTotal}
                  checked={localFilters.groups.includes(group.id)}
                  onCheckedChange={(checked) => toggleGroup(group.id, checked)}
                  className="space-x-3"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic px-2 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-200 dark:border-slate-700">
            {t('book.info.select_category_to_view_groups')}
          </div>
        )}

        {/* Grades */}
        {grades.length > 0 && (
          <div>
            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-4" />
            {renderSectionHeader(
              t('book.info.grades'),
              (localFilters.grades?.length || 0) > 0,
              () => clearSection('grades')
            )}
            <div className={`grid ${gradesGridClass} gap-2 max-h-[200px] overflow-y-auto pr-2`}>
              {grades.map((grade) => (
                <FilterCheckbox
                  key={grade.id}
                  id={`${idPrefix}-grade-${grade.id}`}
                  label={grade.label}
                  checked={localFilters.grades?.includes(grade.id) || false}
                  onCheckedChange={(checked) => toggleGrade(grade.id, checked)}
                  className="space-x-2 p-1"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {!autoSubmit && (
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white/5 dark:bg-slate-900/5 backdrop-blur-sm">
          <Button
            className="w-full"
            onClick={() => onFilterChange(localFilters)}
          >
            {t('home.applyFilters')}
          </Button>
        </div>
      )}
    </div>
  );
};

// Sub-components for cleaner render
const CategoryOption = ({ value, id, label, count, subLabel }: { value: string, id: string, label: string, count?: number, subLabel?: string | React.ReactNode }) => (
  <div className={`flex space-x-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${subLabel ? 'items-start py-0' : 'items-center'}`}>
    <RadioGroupItem value={value} id={id} className={`peer ${subLabel ? 'mt-1' : ''}`} />
    <Label htmlFor={id} className="flex-1 cursor-pointer font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white">
      <div className="flex items-center">
        <span>{label}{count !== undefined && <span className="text-xs text-slate-400 font-normal ml-2">({count})</span>}</span>
      </div>
      {subLabel && <div className="text-xs text-slate-500 font-normal mt-0.5">{subLabel}</div>}
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