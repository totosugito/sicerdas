import { getPeriodictUnits } from '@/components/pages/periodic-table/utils/element-units';
import { useTranslation } from 'react-i18next';
import { ElementDetail } from '@/api/periodic-table/periodic-table';
import { cn } from '@/lib/utils';
import { getElementStyle } from '../utils/element-styles';
import { ElementSearchCombobox } from '../element-details/ElementSearchCombobox';
import { AppRoute } from '@/constants/app-route';

interface ElementHeroIsotopeProps {
  element: ElementDetail;
  theme: string;
}

export function ElementHeroIsotope({ element, theme }: ElementHeroIsotopeProps) {
  const { t } = useTranslation();

  // Calculate isotope counts
  const knownIsotopes = element.atomicProperties.knownIsotopes || [];
  const stableIsotopes = element.atomicProperties.stableIsotopes || [];
  const totalIsotopes = knownIsotopes.length;
  const stableCount = stableIsotopes.length;
  const unstableCount = totalIsotopes - stableCount;

  return (
    <div className="w-full overflow-hidden bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto p-8 md:p-8">
        {/* Header with search combobox */}
        <div className="w-full max-w-sm mx-auto mb-6">
          <ElementSearchCombobox theme={theme} elementPathSegment="isotope" navigationPath={AppRoute.periodicTable.elementIsotope.url} />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          {/* Element symbol and basic info */}
          <div className="flex items-center gap-6">
            <div className={cn(
              "relative w-24 h-24 md:w-32 md:h-32 rounded-lg text-white font-bold text-2xl md:text-4xl",
              getElementStyle(element.atomicGroup, theme).element
            )}>
              <span className="absolute top-1 left-2 text-lg md:text-xl">{element.atomicNumber}</span>
              <span className="absolute inset-0 flex items-center justify-center text-6xl md:text-7xl">{element.atomicSymbol}</span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{element.atomicName}</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {t('periodicTable.periodicTable.var.' + element.atomicProperties.series)}
              </p>
              <p className="text-muted-foreground text-sm">
                {element.atomicProperties?.atomicWeight} {getPeriodictUnits('atomicWeight')}
              </p>
            </div>
          </div>

          {/* Isotope statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg text-center border">
              <div className="text-3xl font-bold text-primary">{totalIsotopes}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('periodicTable.periodicTable.var.total')}</div>
            </div>
            <div className="bg-card p-4 rounded-lg text-center border">
              <div className="text-3xl font-bold text-green-600">{stableCount}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('periodicTable.periodicTable.var.stable')}</div>
            </div>
            <div className="bg-card p-4 rounded-lg text-center border">
              <div className="text-3xl font-bold text-red-600">{unstableCount}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('periodicTable.periodicTable.var.unstable')}</div>
            </div>
          </div>
        </div>

        {/* Isotope summary description */}
        <div className="mt-8 text-center max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">{t('periodicTable.periodicTable.var.isotopeInformation')}</h2>
          <p className="text-muted-foreground">
            {t('periodicTable.periodicTable.var.isotopeDescription', {
              name: element.atomicName,
              total: totalIsotopes,
              stable: stableCount,
              unstable: unstableCount
            })}
          </p>
        </div>
      </div>
    </div>
  );
}