import { useTranslation } from 'react-i18next'
import { Mountain } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { ElementDetail } from '@/api/periodic-table/periodic-table'
import { toPhysics } from '@/lib/my-utils'

interface ElementAbundancesProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementAbundances({ element, expandedSections, toggleSection }: ElementAbundancesProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.abundances')}
      icon={<Mountain className="h-5 w-5" />}
      isExpanded={expandedSections.abundances}
      onToggle={() => toggleSection('abundances')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.percInUniverse')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.percInUniverse || '') })}
            isHtml={true}
            unit={'%'}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.percInSun')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.percInSun || '') })}
            isHtml={true}
            unit={'%'}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.percInMeteorites')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.percInMeteorites || '') })}
            isHtml={true}
            unit={'%'}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.percInEarthsCrust')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.percInEarth || '') })}
            isHtml={true}
            unit={'%'}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.percInOceans')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.percInOceans || '') })}
            isHtml={true}
            unit={'%'}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.percInHumans')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.percInHumans || '') })}
            isHtml={true}
            unit={'%'}
          />
        </div>
      </div>
    </CardSection>
  )
}