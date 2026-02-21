import { useTranslation } from 'react-i18next'
import { Thermometer } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { ElementDetail } from '@/api/periodic-table/periodic-table'
import { toPhysics } from '@/lib/my-utils'
import { celsiusToOther, kelvinToOther } from '../utils/element'

interface ElementThermalProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementThermal({ element, expandedSections, toggleSection }: ElementThermalProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.thermalProperties')}
      icon={<Thermometer className="h-5 w-5" />}
      isExpanded={expandedSections.thermalProperties}
      onToggle={() => toggleSection('thermalProperties')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.phase')}
            value={element.atomicProperties?.phase}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.meltingPoint')}
            value={celsiusToOther(parseFloat(element.atomicProperties?.meltingPoint || ''))}
            unit={getPeriodictUnits('meltingPoint')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.boilingPoint')}
            value={celsiusToOther(parseFloat(element.atomicProperties?.boilingPoint || ''))}
            unit={getPeriodictUnits('boilingPoint')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.criticalTemperature')}
            value={kelvinToOther(parseFloat(element.atomicProperties?.criticalTemperature || ''))}
            unit={getPeriodictUnits('criticalTemperature')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.criticalPressure')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.criticalPressure || '') })}
            unit={getPeriodictUnits('criticalPressure')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.heatOfFusion')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.heatOfFusion || '') })}
            unit={getPeriodictUnits('heatOfFusion')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.heatOfVaporization')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.heatOfVaporization || '') })}
            unit={getPeriodictUnits('heatOfVaporization')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.specificHeat')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.specificHeat || '') })}
            unit={getPeriodictUnits('specificHeat')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.adiabaticIndex')}
            value={element.atomicProperties?.adiabaticIndex}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.neelPoint')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.neelPoint || '') })}
            unit={getPeriodictUnits('neelPoint')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.thermalConductivity')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.thermalConductivity || '') })}
            unit={getPeriodictUnits('thermalConductivity')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.thermalExpansion')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.thermalExpansion || '') })}
            unit={getPeriodictUnits('thermalExpansion')}
            isHtml={true}
          />
        </div>
      </div>
    </CardSection>
  )
}