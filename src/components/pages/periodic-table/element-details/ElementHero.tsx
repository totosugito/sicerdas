import { useState } from 'react';
import { getPeriodictUnits } from '@/components/pages/periodic-table/utils/element-units'
import { getElementImage } from '@/components/pages/periodic-table/utils/element'
import { useTranslation } from 'react-i18next'
import { ElementDetail } from '@/service/periodic-table-api';
import { cn } from '@/lib/utils';
import { getElementStyle } from '../utils/element-styles';
import { ElementSearchCombobox } from './ElementSearchCombobox';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { AppRoute } from '@/constants/app-route';

interface ElementHeroProps {
  element: ElementDetail; // You might want to define a proper type for element
  theme: string;
}

export function ElementHero({ element, theme }: ElementHeroProps) {
  const { t } = useTranslation();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-primary/20 to-background gap-4 flex flex-col">
      {/* Header with search combobox */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-sm">
        <ElementSearchCombobox theme={theme} elementPathSegment="element" navigationPath={AppRoute.periodicTable.elementDetail.url} />
      </div>

      {/* Element visualization */}
      <div className="relative flex flex-col items-end justify-center p-8 md:p-12 pt-24 md:pt-24">
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogTrigger asChild>
            <img
              src={getElementImage({ element: `${element.atomicNumber}.${element.atomicName}`, type: 'atomic' })}
              alt={`${element.atomicName} visualization`}
              className="object-cover h-64 w-64 md:h-72 md:w-72 cursor-pointer"
            />
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center p-6 border-0" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="">
                {element.atomicName}
              </DialogTitle>
            </DialogHeader>
            <img
              src={getElementImage({ element: `${element.atomicNumber}.${element.atomicName}`, type: 'atomic' })}
              alt={`${element.atomicName} visualization`}
              className="h-full w-full object-contain"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Element info overlay */}
      <div className="absolute bottom-0 left-0 p-8 md:p-12 ">
        <div className={cn("rounded-xl flex items-center", getElementStyle(element.atomicGroup, theme).element)}>
          <div className='flex py-1 px-4 items-center'>
            <span className="text-sm font-medium">{element.atomicNumber}</span>
            <span className="mx-2 w-[1px] bg-muted h-4"></span>
            <span className="text-sm font-medium">{t('periodicTable.periodicTable.var.' + element.atomicProperties.series)}</span>
          </div>
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