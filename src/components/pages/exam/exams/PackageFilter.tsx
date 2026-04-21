import { useCallback, useState, useEffect, useMemo } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { RadioGroup } from "@/components/ui/radio-group";
import { CategoryOption, FilterCheckbox } from "../../book/list/FilterOptions";
import { ExamFilterParamsResponse } from "@/api/exam-packages";
import { Button } from "@/components/ui/button";

interface PackageFilterProps {
  selectedFilters: {
    categoryKey: string;
    grades?: number[];
  };
  onFilterChange: (filters: { categoryKey: string; grades?: number[] }) => void;
  idPrefix?: string;
  autoSubmit?: boolean;
  filterData?: ExamFilterParamsResponse;
}

export const PackageFilter = ({
  selectedFilters,
  onFilterChange,
  idPrefix = "filter",
  autoSubmit = true,
  filterData,
}: PackageFilterProps) => {
  const { t } = useAppTranslation();
  const categories = filterData?.data || [];

  const [localFilters, setLocalFilters] = useState(selectedFilters);

  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  const updateFilters = useCallback(
    (newFilters: typeof selectedFilters) => {
      setLocalFilters(newFilters);
      if (autoSubmit) {
        onFilterChange(newFilters);
      }
    },
    [autoSubmit, onFilterChange],
  );

  const { grades, gradesGridClass } = useMemo(() => {
    const categoryKey = localFilters.categoryKey;
    if (!categoryKey) return { grades: [], gradesGridClass: "" };

    const activeCategory = categories.find((c) => c.key === categoryKey);
    if (!activeCategory || activeCategory.grades.length === 0) {
      return { grades: [], gradesGridClass: "" };
    }

    return {
      grades: activeCategory.grades.map((g) => ({
        id: g.id,
        label: g.name,
        count: g.stats.activeCount,
      })),
      gradesGridClass: "grid-cols-2",
    };
  }, [localFilters.categoryKey, categories]);

  const handleCategoryChange = (value: string) => {
    updateFilters({
      ...localFilters,
      categoryKey: value === "all" ? "" : value,
      grades: [], // Reset grades when category changes
    });
  };

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
          {t(($) => $.exam.reset)}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        {/* Categories */}
        <div className="">
          <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            {t(($) => $.education.categories.text)}
          </h3>
          <RadioGroup
            value={localFilters.categoryKey || "all"}
            onValueChange={handleCategoryChange}
            className="space-y-1"
          >
            <CategoryOption value="all" id={`${idPrefix}-cat-all`} label={t(($) => $.exam.all)} />
            {categories.map((category) => (
              <CategoryOption
                key={category.id}
                value={category.key}
                id={`${idPrefix}-cat-${category.id}`}
                label={category.name}
                count={category.grades.reduce((sum, g) => sum + g.stats.activeCount, 0)}
              />
            ))}
          </RadioGroup>
        </div>

        {/* Grades Filter */}
        {grades.length > 1 && (
          <>
            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
            <div>
              {renderSectionHeader(
                t(($) => $.education.grade.text),
                (localFilters.grades?.length || 0) > 0,
                () => clearSection("grades"),
              )}
              <div className={`grid ${gradesGridClass} gap-2 max-h-[200px] overflow-y-auto pr-2`}>
                {grades.map((grade) => (
                  <FilterCheckbox
                    key={grade.id}
                    id={`${idPrefix}-grade-${grade.id}`}
                    label={grade.label}
                    count={grade.count}
                    checked={localFilters.grades?.includes(grade.id) || false}
                    onCheckedChange={(checked) => toggleGrade(grade.id, checked)}
                    className="space-x-2 p-1"
                  />
                ))}
              </div>
            </div>
          </>
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
