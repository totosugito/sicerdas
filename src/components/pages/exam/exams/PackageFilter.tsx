import { useCallback, useState, useEffect, useMemo } from "react";
import { useListCategorySimple } from "@/api/education-categories";
import { RadioGroup } from "@/components/ui/radio-group";
import { useAppTranslation } from "@/lib/i18n-typed";
import { CategoryOption, FilterCheckbox } from "../../book/list/FilterOptions";

const EDUCATION_CATEGORY = ["ujian-semester", "kuis-mata-pelajaran", "try-out", "latihan-soal"];

interface PackageFilterProps {
  selectedFilters: {
    categoryKey: string;
    grades?: number[];
  };
  onFilterChange: (filters: { categoryKey: string; grades?: number[] }) => void;
  idPrefix?: string;
  autoSubmit?: boolean;
}

export const PackageFilter = ({
  selectedFilters,
  onFilterChange,
  idPrefix = "filter",
  autoSubmit = true,
}: PackageFilterProps) => {
  const { t } = useAppTranslation();

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

  const categoryQuery = useListCategorySimple({ limit: 100 });
  const categories = categoryQuery.data?.data?.items || [];

  const { grades, gradesGridClass } = useMemo(() => {
    const categoryKey = localFilters.categoryKey;
    if (!categoryKey) return { grades: [], gradesGridClass: "" };

    if (EDUCATION_CATEGORY.includes(categoryKey)) {
      return {
        grades: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, label: (i + 1).toString() })),
        gradesGridClass: "grid-cols-4",
      };
    }

    return { grades: [], gradesGridClass: "" };
  }, [localFilters.categoryKey]);

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
                key={category.value}
                value={category.key}
                id={`${idPrefix}-cat-${category.value}`}
                label={category.label}
              />
            ))}
          </RadioGroup>
        </div>

        {/* Grades Filter */}
        {grades.length > 0 && (
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
    </div>
  );
};
