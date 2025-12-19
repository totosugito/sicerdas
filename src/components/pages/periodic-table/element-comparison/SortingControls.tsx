import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PropertyDefinition, SortDirection } from './types';
import { useTranslation } from 'react-i18next';

interface SortingControlsProps {
  propertyDefinitions: PropertyDefinition[];
  sortBy: string;
  sortDirection: SortDirection;
  onSortByChange: (newSortBy: string) => void;
  onSortDirectionChange: (newDirection: SortDirection) => void;
  sortType: {
    asc: { value: 'asc'; label: string };
    desc: { value: 'desc'; label: string };
    none: { value: 'none'; label: string };
  };
}

export function SortingControls({
  propertyDefinitions,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  sortType
}: SortingControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">{t('periodicTable.elementComparison.sortBy')}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="font-normal">
              {sortBy === 'atomicId' 
                ? t('periodicTable.periodicTable.var.atomicNumber') 
                : propertyDefinitions.find(p => p.key === sortBy)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-150 overflow-y-auto">
            {propertyDefinitions.map(property => (
              <DropdownMenuItem
                key={property.key}
                onClick={() => onSortByChange(property.key)}
                className={sortBy === property.key ? "bg-accent" : "my-0.5"}
              >
                {property.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">{t('periodicTable.elementComparison.sortDirection')}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="font-normal gap-1.5"
            >
              {sortType[sortDirection as keyof typeof sortType].label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onSortDirectionChange(sortType.asc.value)}
              className={sortDirection === 'asc' ? "bg-accent" : "my-0.5"}
            >
              <span>{sortType.asc.label}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortDirectionChange(sortType.desc.value)}
              className={sortDirection === 'desc' ? "bg-accent" : "my-0.5"}
            >
              <span>{sortType.desc.label}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortDirectionChange(sortType.none.value)}
              className={sortDirection === 'none' ? "bg-accent" : "my-0.5"}
            >
              <span>{sortType.none.label}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}