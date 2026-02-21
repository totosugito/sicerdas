import { useTranslation } from 'react-i18next'
import { Ruler } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { ElementDetail } from '@/api/periodic-table/periodic-table'
import { toPhysics } from '@/lib/my-utils'

interface ElementDimensionProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementDimension({ element, expandedSections, toggleSection }: ElementDimensionProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.atomicDimensionsAndStructure')}
      icon={<Ruler className="h-5 w-5" />}
      isExpanded={expandedSections.atomicDimensions}
      onToggle={() => toggleSection('atomicDimensions')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.atomicRadius')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.atomicRadius || '') })}
            unit={getPeriodictUnits('atomRadius')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.covalentRadius')}
            value={element.atomicProperties?.covalentRadius}
          // unit={getPeriodictUnits('atomRadius')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.vanDerWaalsRadius')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.vanDerWaalsRadius || '') })}
            unit={getPeriodictUnits('vanDerWaalsRadius')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.crystalStructure')}
            value={element.atomicProperties?.crystalStructure}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.latticeAngles')}
            value={element.atomicProperties?.latticeAngles}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.latticeConstants')}
            value={element.atomicProperties?.latticeConstants}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.spaceGroupName')}
            value={element.atomicProperties?.spaceGroupName}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.spaceGroupNumber')}
            value={element.atomicProperties?.spaceGroupNumber}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.empiricalAtomicRadius')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.empiricalAtomicRadius || '') })}
            unit={getPeriodictUnits('empiricalAtomicRadius')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.atomicSpectra')}
            value={element.atomicProperties?.atomicSpectra}
          />
        </div>
      </div>
    </CardSection>
  )
}