import { useTranslation } from 'react-i18next'
import { Layers } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { toPhysics } from '@/lib/my-utils'
import { ElementDetail } from '@/service/periodic-table-api'
import ViewOxidationStates from './ViewOxidationStates'

interface ElementClassificationProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementClassification({ element, expandedSections, toggleSection }: ElementClassificationProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.classifications')}
      icon={<Layers className="h-5 w-5" />}
      isExpanded={expandedSections.classifications}
      onToggle={() => toggleSection('classifications')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.alternateNames')}
            value={element.atomicProperties?.alternateNames}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.namesOfAllotropes')}
            value={element.atomicProperties?.namesOfAllotropes}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.group')}
            value={element.atomicProperties?.group}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.period')}
            value={element.atomicProperties?.period}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.block')}
            value={element.atomicProperties?.block}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.series')}
            value={t(`periodicTable.periodicTable.var.${element.atomicProperties?.series || ''}`)}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.color')}
            value={element.atomicProperties?.color}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.gasPhase')}
            value={element.atomicProperties?.gasPhase}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.electronConfiguration')}
            value={element.atomicProperties?.electronConfiguration}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.physicalDescription')}
            value={element.atomicProperties?.physicalDescription}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.groundLevel')}
            value={element.atomicProperties?.groundLevel}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.estimatedCrustalAbundance')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.estimatedCrustalAbundance || '') })}
            unit={getPeriodictUnits('estimatedCrustalAbundance')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.estimatedOceanicAbundance')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.estimatedOceanicAbundance || '') })}
            unit={getPeriodictUnits('estimatedOceanicAbundance')}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.casNumber')}
            value={element.atomicProperties?.casNumber}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.cidNumber')}
            value={element.atomicProperties?.cidNumber}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.inChI')}
            value={element.atomicProperties?.inChI}
          />

          <PropertyItem
            label={t('periodicTable.periodicTable.var.inChiKey')}
            value={element.atomicProperties?.inChiKey}
          />
        </div>

        {element.atomicProperties?.oxidationStates?.v && element.atomicProperties?.oxidationStates?.v.length > 0 && (
          <div className="flex flex-col gap-2">
            <PropertyItem label={t('periodicTable.periodicTable.var.oxidationStates')} value={undefined} />
            <ViewOxidationStates oxs={element.atomicProperties.oxidationStates.v} />
          </div>
        )}
      </div>
    </CardSection>
  )
}