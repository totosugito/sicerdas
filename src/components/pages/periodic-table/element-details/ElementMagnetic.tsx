import { useTranslation } from 'react-i18next'
import { Magnet } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { ElementDetail } from '@/service/periodic-table-api'
import { toPhysics } from '@/lib/my-utils'

interface ElementMagneticProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementMagnetic({ element, expandedSections, toggleSection }: ElementMagneticProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.magneticProperties')}
      icon={<Magnet className="h-5 w-5" />}
      isExpanded={expandedSections.magnetic}
      onToggle={() => toggleSection('magnetic')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.magneticType')}
            value={element.atomicProperties?.magneticType || ''}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.curiePoint')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.curiePoint || '') })}
            isHtml={true}
            unit={getPeriodictUnits('curiePoint')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.massMagneticSusceptibility')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.massMagneticSusceptibility || '') })}
            isHtml={true}
            unit={getPeriodictUnits('massMagneticSusceptibility')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.molarMagneticSusceptibility')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.molarMagneticSusceptibility || '') })}
            isHtml={true}
            unit={getPeriodictUnits('molarMagneticSusceptibility')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.volumeMagneticSusceptibility')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.volumeMagneticSusceptibility || '') })}
            isHtml={true}
          />
        </div>
      </div>
    </CardSection>
  )
}