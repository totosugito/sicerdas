import { useTranslation } from 'react-i18next'
import { ShieldAlert } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { ElementDetail } from '@/api/periodic-table/periodic-table'
import { cn } from '@/lib/utils';

interface ViewNfpaProps {
  label: string[];
}

const ViewNfpa = ({ label = ["1", "2", "3", "_OW"] }: ViewNfpaProps) => {
  const createLabel = (text: string, color: string) => {
    const isLineThrough = text.startsWith("_");
    const textContent = isLineThrough ? text.substring(1) : text;

    return (
      <div
        className="flex items-center justify-center w-full h-full"
        style={{ transform: 'rotate(-45deg)' }}
      >
        <span
          className={cn(`font-bold ${isLineThrough ? 'line-through' : ''}`, color)}
        >
          {textContent}
        </span>
      </div>
    );
  };

  if (!label || label.length === 0) {
    return <div />;
  }

  return (
    <div
      className="p-4"
      style={{ transform: 'rotate(45deg)' }}
    >
      <div className="flex flex-col min-w-max">
        <div className="flex min-w-max">
          {/* Red box - Health */}
          <div
            className="w-8 h-8 flex border-l border-t border-red-500"
            style={{ backgroundColor: 'red' }}
          >
            {createLabel(label[0], 'text-white')}
          </div>
          {/* Yellow box - Reactivity */}
          <div
            className="w-8 h-8 flex border border-yellow-500"
            style={{ backgroundColor: 'yellow' }}
          >
            {createLabel(label[2], 'text-black')}
          </div>
        </div>
        <div className="flex min-w-max">
          {/* Blue box - Flammability */}
          <div
            className="w-8 h-8 flex border border-blue-500"
            style={{ backgroundColor: 'blue' }}
          >
            {createLabel(label[1], 'text-white')}
          </div>
          {/* White box - Special */}
          <div
            className="w-8 h-8 flex border-r border-b border-gray-300"
            style={{ backgroundColor: 'white' }}
          >
            {createLabel(label[3], 'text-black')}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ElementHealthSafetyProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementHealthSafety({ element, expandedSections, toggleSection }: ElementHealthSafetyProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.healthAndSafety')}
      icon={<ShieldAlert className="h-5 w-5" />}
      isExpanded={expandedSections.healthSafety}
      onToggle={() => toggleSection('healthSafety')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.dOTHazardClass')}
            value={element.atomicProperties?.dOTHazardClass || ''}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.dOTNumbers')}
            value={element.atomicProperties?.dOTNumbers || ''}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.rtecsNumber')}
            value={element.atomicProperties?.rtecsNumber || ''}
          />
        </div>

        {/* NFPA Label - displayed as a column if available */}
        <div className="flex flex-col gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.nfpaLabel')}
            value={undefined}
          />
          {element.atomicProperties?.nfpaLabel && element.atomicProperties?.nfpaLabel.length > 0 &&
            (<div className="flex">
              <ViewNfpa label={element.atomicProperties.nfpaLabel} /></div>)}

        </div>

      </div>
    </CardSection>
  )
}