import { PeriodicCell } from '@/components/pages/periodic-table/periodic-table';
import { ProgressElement } from "./ProgressElement";
import { PeriodicElement, PropertyDefinition } from "../types/types";
import { useTranslation } from 'react-i18next';
import { toPhysics } from "@/lib/my-utils";
import { getPeriodictUnits } from "../utils/element-units";
import { useNavigate } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { PropertyItem } from '../element-details';

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
  const navigate = useNavigate();

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all bg-card ${
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/30'
      }`}
      onClick={() => onSelect(isSelected ? null : element.id)}
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
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-2 mb-4">
            <PropertyItem label={t('periodicTable.periodicTable.var.atomicNumber')} value={element.atomicNumber} />
            <PropertyItem label={t('periodicTable.periodicTable.var.symbol')} value={element.atomicSymbol} />
            <PropertyItem label={t('periodicTable.periodicTable.var.atomicName')} value={element.atomicName} />

            {propertyDefinitions.map(property => {
              const key_ = property.key as keyof typeof element.prop;
              const value = toPhysics({ value: parseFloat(element.prop?.[key_] || '') });       
              return (
                <PropertyItem key={property.key} label={t('periodicTable.periodicTable.var.' + property.key)} value={value} unit={getPeriodictUnits(key_)} />
              );
            })}
          </div>
          <div className="flex justify-end">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate({ 
                  to: AppRoute.periodicTable.elementDetail.url, 
                  params: { id: element.atomicNumber.toString() } 
                });
              }}
              className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {t('periodicTable.elementComparison.viewDetails')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}