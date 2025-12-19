import { useState } from "react";
import { PeriodicCell } from '@/components/pages/periodic-table/periodic-table';
import { ProgressElement } from "./ProgressElement";
import { PeriodicElement, PropertyDefinition } from "./types";
import { useTranslation } from 'react-i18next';

interface ElementComparisonItemProps {
  element: PeriodicElement;
  isSelected: boolean;
  onSelect: (atomicId: number | null) => void;
  propertyValue: number;
  maxValue: number;
  unit: string;
  propertyLabel: string;
  propertyDefinitions: PropertyDefinition[];
}

export function ElementComparisonItem({
  element,
  isSelected,
  onSelect,
  propertyValue,
  maxValue,
  unit,
  propertyLabel,
  propertyDefinitions
}: ElementComparisonItemProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted'
      }`}
      onClick={() => onSelect(isSelected ? null : element.atomicId)}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16">
          <PeriodicCell 
            element={element}
            cellSize={64}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-sm mb-1">
            <span className="">
              {element.atomicName}
            </span>
            <span className="font-mono">
              {propertyValue.toFixed(2)} {unit}
            </span>
          </div>
          <ProgressElement value={propertyValue} max={maxValue} />
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{element.atomicName} {t('periodicTable.elementComparison.details')}</h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {expanded ? t('periodicTable.elementComparison.showLess') : t('periodicTable.elementComparison.showMore')}
            </button>
          </div>
          
          {expanded && (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">{t('periodicTable.periodicTable.var.atomicNumber')}:</span>{' '}
                <span className="font-mono">{element.atomicNumber}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">{t('periodicTable.periodicTable.var.symbol')}:</span>{' '}
                <span className="font-mono">{element.atomicSymbol}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">{t('periodicTable.periodicTable.var.atomicName')}:</span>{' '}
                <span className="font-mono">{element.atomicName}</span>
              </div>
              {propertyDefinitions.map(property => {
                const value = element.prop?.[property.key as keyof typeof element.prop];
                if (value === undefined) return null;
                
                return (
                  <div key={property.key} className="text-sm">
                    <span className="font-medium text-muted-foreground">{property.label}:</span>{' '}
                    <span className="font-mono">{value} {property.unit}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}