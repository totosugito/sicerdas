import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { PropertyItem } from './PropertyItem';
import { toPhysics } from '@/lib/my-utils';
import { getPeriodictUnits } from '../utils/element-units';

interface IsotopeData {
  id: number;
  sIdentified: string;
  halfLife: string;
  spinParity: string;
  atomicWeight: string;
  abundance: string;
  massExcess: string;
  bindingEnergy: string;
  magneticMoment: string;
  quadrupoleMoment: string;
}

interface IsotopeCardProps {
  atomColor: string;
  isotope: IsotopeData;
  atomicSymbol: string;
}

export const IsotopeCard = ({ atomColor, isotope, atomicSymbol }: IsotopeCardProps) => {
  const { t } = useTranslation();
  const isStable = isotope.halfLife === "Stable";
  const hasAtomicWeight = isotope.atomicWeight !== "None" && isotope.atomicWeight !== "";

  return (
    <div
      className={cn(
        "relative group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        isStable && "border-l-4 border-l-green-500",
      )}
    >
      {/* Isotope Symbol */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          <span className={cn("absolute -top-1 -left-1 text-sm font-mono", `text-[${atomColor}]`)}>
            {isotope.id}
          </span>
          <span className={cn("text-3xl font-bold pl-3", `text-[${atomColor}]`)}>{atomicSymbol}</span>
        </div>
        <div className="flex flex-1">
        </div>
        {hasAtomicWeight && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{t('periodicTable.periodicTable.var.atomicWeight')}</div>
            <div className="text-sm font-bold text-foreground">{isotope.atomicWeight} <span className="text-sm font-normal text-muted-foreground">{getPeriodictUnits('atomicWeight')}</span></div>
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 gap-2 text-xs">
        <PropertyItem
          label={isotope.sIdentified}
          value={isotope.spinParity}
          isHtml={true}
        />
        <PropertyItem label={t('periodicTable.periodicTable.var.halfLife')} value={isotope.halfLife} isHtml={true}/>
        <PropertyItem label={t('periodicTable.periodicTable.var.massExcess')} value={isotope.massExcess} />
        <PropertyItem label={t('periodicTable.periodicTable.var.bindingEnergy')} value={isotope.bindingEnergy} />
        {isotope.magneticMoment && (
          <PropertyItem label={t('periodicTable.periodicTable.var.magneticMoment')} value={isotope.magneticMoment} />
        )}
        {isotope.quadrupoleMoment && (
          <PropertyItem label={t('periodicTable.periodicTable.var.quadrupoleMomentIsotope')} value={isotope.quadrupoleMoment} />
        )}
        {isotope.abundance && (
          <PropertyItem label={t('periodicTable.periodicTable.var.abundance')} value={isotope.abundance} />
        )}
      </div>
    </div>
  );
};