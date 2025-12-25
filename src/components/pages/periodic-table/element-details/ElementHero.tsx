import { getPeriodictUnits } from '@/components/pages/periodic-table/utils/element-units'
import { getElementImage } from '@/components/pages/periodic-table/utils/element'
import { useTranslation } from 'react-i18next'
import { ElementDetail } from '@/service/periodic-table-api';

interface ElementHeroProps {
  element: ElementDetail; // You might want to define a proper type for element
}

export function ElementHero({ element }: ElementHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-primary/20 to-background mb-6 h-80 md:h-96">
      {/* Element visualization */}
      <div className="relative flex flex-col items-end justify-center p-8 md:p-12">
        <img
          src={getElementImage({ element: `${element.atomicNumber}.${element.atomicName}`, type: 'atomic' })}
          alt={`${element.atomicName} visualization`}
          className="object-cover h-64 w-64 md:h-72 md:w-72"
        />
      </div>

      {/* Element info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 ">
        <div className="rounded-xl px-2 py-2">
          <span className="text-sm font-medium text-muted-foreground md:text-base">{element.atomicNumber}</span>
          <span className="mx-2 text-muted-foreground">|</span>
          <span className="text-sm font-medium text-primary md:text-base">{t('periodicTable.periodicTable.var.' + element.atomicProperties.series)}</span>
        </div>

        <div className="flex items-baseline gap-4">
          <span className="text-5xl font-bold tracking-tight md:text-8xl">{element.atomicSymbol}</span>
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-foreground md:text-3xl">{element.atomicName}</span>
            <span className="font-mono text-sm text-muted-foreground md:text-base">{element.atomicProperties?.atomicWeight} {getPeriodictUnits('atomicWeight')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}