import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { ElementDetail } from '@/api/periodic-table-api'
import { toPhysics } from '@/lib/my-utils'

interface ElementElectricalProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementElectrical({ element, expandedSections, toggleSection }: ElementElectricalProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.electricalProperties')}
      icon={<Zap className="h-5 w-5" />}
      isExpanded={expandedSections.electrical}
      onToggle={() => toggleSection('electrical')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.electricalType')}
            value={element.atomicProperties?.electricalType || '-'}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.electricalConductivity')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.electricalConductivity || '') })}
            isHtml={true}
            unit={getPeriodictUnits('electricalConductivity')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.resistivity')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.resistivity || '') })}
            isHtml={true}
            unit={getPeriodictUnits('resistivity')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.superconductingPoint')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.superconductingPoint || '') })}
            isHtml={true}
          />
        </div>
      </div>
    </CardSection>
  )
}