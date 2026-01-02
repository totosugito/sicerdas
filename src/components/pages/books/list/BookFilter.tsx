import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FilterParamCategory, useBookFilterParams } from '@/service/book';
import { cn } from '@/lib/utils';

interface BookFilterProps {
  selectedFilters: {
    categories: number[];
    groups: number[];
  };
  onFilterChange: (filters: {
    categories: number[];
    groups: number[];
  }) => void;
}

export const BookFilter = ({ selectedFilters, onFilterChange }: BookFilterProps) => {
  const { t } = useTranslation();
  const { data: filterParamsData, isLoading, isError } = useBookFilterParams();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = filterParamsData?.data || [];

  // Initialize expanded categories when data is loaded
  useEffect(() => {
    if (categories.length > 0 && expandedCategories.length === 0) {
      // Expand all categories by default
      setExpandedCategories(categories.map(cat => `category-${cat.id}`));
    }
  }, [categories, expandedCategories.length]);

  const toggleCategory = (categoryId: number) => {
    // If the category is already selected, deselect it
    if (selectedFilters.categories.includes(categoryId)) {
      onFilterChange({
        categories: [],
        groups: []
      });
    } else {
      // Select only this category and all its groups
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        const categoryGroups = category.groups.map(group => group.id);
        onFilterChange({
          categories: [categoryId],
          groups: categoryGroups
        });
      }
    }
  };

  const toggleGroup = (groupId: number) => {
    // Only allow group selection if a category is already selected
    if (selectedFilters.categories.length === 0) return;
    
    const isSelected = selectedFilters.groups.includes(groupId);
    let newGroups: number[];
    
    if (isSelected) {
      // Remove the group
      newGroups = selectedFilters.groups.filter(id => id !== groupId);
      
      // If no groups are selected for this category, deselect the category too
      const category = categories.find(cat => 
        cat.groups.some(group => group.id === groupId)
      );
      
      if (category && newGroups.filter(g => 
        category.groups.some(grp => grp.id === g)
      ).length === 0) {
        // If no groups from this category are selected, deselect the category
        onFilterChange({
          categories: [],
          groups: newGroups
        });
      } else {
        onFilterChange({
          categories: selectedFilters.categories,
          groups: newGroups
        });
      }
    } else {
      // Add the group
      newGroups = [...selectedFilters.groups, groupId];
      onFilterChange({
        categories: selectedFilters.categories,
        groups: newGroups
      });
    }
  };

  // Helper function to find group and its category
  const findGroupById = (groupId: number) => {
    for (const category of categories) {
      const group = category.groups.find(g => g.id === groupId);
      if (group) {
        return { ...group, categoryId: category.id };
      }
    }
    return null;
  };

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      groups: []
    });
  };

  const toggleAccordion = (value: string[]) => {
    setExpandedCategories(value);
  };

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border rounded-lg text-center text-red-500">
        {t('home.failedToLoadFilters')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          {t('home.filters')}
        </h3>
        {(selectedFilters.categories.length > 0 || selectedFilters.groups.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            {t('home.clearFilters')}
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {(selectedFilters.categories.length > 0 || selectedFilters.groups.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.categories.map(categoryId => {
            const category = categories.find(cat => cat.id === categoryId);
            return category ? (
              <Badge 
                key={`cat-${categoryId}`} 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleCategory(categoryId)}
              >
                {category.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ) : null;
          })}
          {selectedFilters.groups.map(groupId => {
            const group = findGroupById(groupId);
            return group ? (
              <Badge 
                key={`grp-${groupId}`} 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleGroup(groupId)}
              >
                {group.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Filter Categories */}
      <Accordion 
        type="multiple" 
        value={expandedCategories} 
        onValueChange={toggleAccordion}
        className="w-full"
      >
        {categories.map((category) => {
          // Check if this category is currently selected
          const isCategorySelected = selectedFilters.categories.includes(category.id);
          
          return (
            <AccordionItem 
              value={`category-${category.id}`} 
              key={category.id}
              className="border rounded-lg mb-2"
            >
              <AccordionTrigger className="p-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isCategorySelected}
                      onCheckedChange={() => toggleCategory(category.id)}
                      id={`category-${category.id}`}
                      className="mr-2"
                    />
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({category.groups.length})
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-3 pt-0">
                <div className="space-y-2">
                  {category.groups.map((group) => {
                    // Only show groups if the category is selected
                    if (!isCategorySelected) {
                      // If the category is not selected, only show groups that are individually selected
                      if (!selectedFilters.groups.includes(group.id)) {
                        return null;
                      }
                    }
                    
                    return (
                      <div 
                        key={group.id} 
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                      >
                        <Checkbox
                          checked={selectedFilters.groups.includes(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                          id={`group-${group.id}`}
                        />
                        <label 
                          htmlFor={`group-${group.id}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                        >
                          {group.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({group.stats.bookTotal} {t('home.books')})
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};