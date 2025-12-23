import { useState } from "react";
import { PeriodicCell } from '@/components/pages/periodic-table/periodic-table';
import { ProgressElement } from "./ProgressElement";
import { PeriodicElement, PropertyDefinition } from "./types";
import { useTranslation } from 'react-i18next';
import { toPhysics } from "@/lib/my-utils";
import { getPeriodictUnits } from "../element-details/element-units";
import { cn } from "@/lib/utils";

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
      className={`border rounded-lg p-4 cursor-pointer transition-all bg-card ${
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/30'
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
              <span dangerouslySetInnerHTML={{ __html: toPhysics({ value: propertyValue }) }} /> {unit}
            </span>
          </div>
          <ProgressElement value={isNaN(propertyValue) ? 0 : propertyValue} max={maxValue} />
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
                <span className="font-medium text-foreground">{t('periodicTable.periodicTable.var.atomicNumber')}:</span>{' '}
                <span className="font-mono">{element.atomicNumber}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">{t('periodicTable.periodicTable.var.symbol')}:</span>{' '}
                <span className="font-mono">{element.atomicSymbol}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">{t('periodicTable.periodicTable.var.atomicName')}:</span>{' '}
                <span className="font-mono">{element.atomicName}</span>
              </div>
              {propertyDefinitions.map(property => {
                const key_ = property.key as keyof typeof element.prop;
                const value = toPhysics({ value: parseFloat(element.prop?.[key_] || '0') }); 
                const hasValue = value !== "N/A";             
                return (
                  <div key={property.key} className="text-sm">
                    <span className={cn("font-medium ", hasValue ? "text-foreground" : "text-muted-foreground/80")}>{t('periodicTable.periodicTable.var.' + property.key)}:</span>{' '}
                    <span className={cn("font-mono", hasValue ? "text-foreground" : "text-muted-foreground/80")} dangerouslySetInnerHTML={{ __html: value + " " + (getPeriodictUnits(key_)) }}></span>
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