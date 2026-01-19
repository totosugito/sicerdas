import { useTranslation } from 'react-i18next'
import { Weight } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { ElementDetail } from '@/api/periodic-table-api'
import { toPhysics } from '@/lib/my-utils'

interface ElementBulkPhysicalProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementBulkPhysical({ element, expandedSections, toggleSection }: ElementBulkPhysicalProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.bulkPhysicalProperties')}
      icon={<Weight className="h-5 w-5" />}
      isExpanded={expandedSections.bulkPhysical}
      onToggle={() => toggleSection('bulkPhysical')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.density')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.density || '') })}
            unit={getPeriodictUnits('density')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.densityLiquid')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.densityLiquid || '') })}
            unit={getPeriodictUnits('density')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.molarVolume')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.molarVolume || '') })}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.brinellHardness')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.brinellHardness || '') })}
            unit={getPeriodictUnits('brinellHardness')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.mohsHardness')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.mohsHardness || '') })}
            unit={getPeriodictUnits('mohsHardness')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.vickersHardness')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.vickersHardness || '') })}
            unit={getPeriodictUnits('vickersHardness')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.bulkModulus')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.bulkModulus || '') })}
            unit={getPeriodictUnits('bulkModulus')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.shearModulus')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.shearModulus || '') })}
            unit={getPeriodictUnits('shearModulus')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.youngModulus')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.youngModulus || '') })}
            unit={getPeriodictUnits('youngModulus')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.poissonRatio')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.poissonRatio || '') })}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.refractiveIndex')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.refractiveIndex || '') })}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.speedOfSound')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.speedOfSound || '') })}
            unit={getPeriodictUnits('speedOfSound')}
            isHtml={true}
          />
        </div>
      </div>
    </CardSection>
  )
}