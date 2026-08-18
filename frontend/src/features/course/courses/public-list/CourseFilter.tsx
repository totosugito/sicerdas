import { useCallback, useState, useEffect } from "react";
import type { FilterParamsCategoryData } from "@/api/course/courses";
import { useAppTranslation } from "@/lib/i18n-typed";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { CategoryOption, FilterCheckbox } from "./FilterOptions";

interface CourseFilterProps {
  selectedFilters: {
    categories: string[];
    grades: number[];
  };
  onFilterChange: (filters: { categories: string[]; grades: number[] }) => void;
  filterData?: {
    data: FilterParamsCategoryData[];
  };
  autoSubmit?: boolean;
  idPrefix?: string;
}

export const CourseFilter = ({
  selectedFilters,
  onFilterChange,
  filterData,
  autoSubmit = true,
  idPrefix = "filter",
}: CourseFilterProps) => {
  const { t } = useAppTranslation();
  const categories = filterData?.data || [];

  const [localFilters, setLocalFilters] = useState(selectedFilters);

  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  // Handle single category selection
  const activeCategoryId = localFilters.categories[0] || "";
  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const displayedGrades = activeCategory ? activeCategory.grades : [];

  const updateFilters = useCallback(
    (newFilters: typeof selectedFilters) => {
      setLocalFilters(newFilters);
      if (autoSubmit) {
        onFilterChange(newFilters);
      }
    },
    [autoSubmit, onFilterChange],
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateFilters({
        categories: value === "all" ? [] : [value],
        grades: [],
      });
    },
    [updateFilters],
  );

  const toggleGrade = useCallback(
    (gradeId: number, checked: boolean) => {
      const currentGrades = localFilters.grades || [];
      const newGrades = checked
        ? [...currentGrades, gradeId]
        : currentGrades.filter((g) => g !== gradeId);

      updateFilters({
        ...localFilters,
        grades: newGrades,
      });
    },
    [localFilters, updateFilters],
  );

  const clearSection = useCallback(
    (key: "grades") => {
      updateFilters({
        ...localFilters,
        [key]: [],
      });
    },
    [localFilters, updateFilters],
  );

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
          {t(($) => $.labels.reset)}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            {t(($) => $.education.categories.text)}
          </h3>
          <RadioGroup
            value={activeCategoryId || "all"}
            onValueChange={handleCategoryChange}
            className="space-y-1"
          >
            <CategoryOption
              value="all"
              id={`${idPrefix}-cat-all`}
              label={t(($) => $.course.public.allCategories)}
            />
            {categories.map((category) => {
              const totalCount = category.grades.reduce((acc, g) => acc + (g.stats?.activeCount || 0), 0);
              return (
                <CategoryOption
                  key={category.id}
                  value={category.id}
                  id={`${idPrefix}-cat-${category.id}`}
                  label={category.name}
                  count={totalCount}
                />
              );
            })}
          </RadioGroup>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

        {/* Grades */}
        {activeCategoryId && displayedGrades.length > 0 ? (
          <div>
            {renderSectionHeader(
              t(($) => $.education.grade.text),
              localFilters.grades.length > 0,
              () => clearSection("grades"),
            )}
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {displayedGrades.map((grade) => (
                <FilterCheckbox
                  key={grade.id}
                  id={`${idPrefix}-grade-${grade.id}`}
                  label={grade.name}
                  count={grade.stats?.activeCount}
                  checked={localFilters.grades.includes(grade.id)}
                  onCheckedChange={(checked) => toggleGrade(grade.id, checked)}
                  className="space-x-2 p-1"
                />
              ))}
            </div>
          </div>
        ) : activeCategoryId ? (
          <div className="text-sm text-slate-400 italic px-2 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-200 dark:border-slate-700">
            {t(($) => $.course.public.noGradesInCategory)}
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic px-2 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-200 dark:border-slate-700">
            {t(($) => $.course.public.selectCategoryToViewGrades)}
          </div>
        )}
      </div>

      {!autoSubmit && (
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white/5 dark:bg-slate-900/5 backdrop-blur-sm">
          <Button className="w-full" onClick={() => onFilterChange(localFilters)}>
            {t(($) => $.labels.applyFilters)}
          </Button>
        </div>
      )}
    </div>
  );
};
