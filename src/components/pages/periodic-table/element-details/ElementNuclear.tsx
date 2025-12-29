import { useTranslation } from 'react-i18next'
import { Atom } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { ElementDetail } from '@/service/periodic-table-api'
import { toPhysics } from '@/lib/my-utils'
import { getIsotopeAbundance, createAtomIsotopeTag } from '../utils/element'

interface ElementNuclearProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementNuclear({ element, expandedSections, toggleSection }: ElementNuclearProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.nuclearProperties')}
      icon={<Atom className="h-5 w-5" />}
      isExpanded={expandedSections.nuclear}
      onToggle={() => toggleSection('nuclear')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.halfLife')}
            value={element.atomicProperties?.halfLife || ''}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.lifetime')}
            value={element.atomicProperties?.lifetime || ''}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.decayMode')}
            value={element.atomicProperties?.decayMode || ''}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.quantumNumbers')}
            value={element.atomicProperties?.quantumNumbers || ''}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.neutronCrossSection')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.neutronCrossSection || '') })}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.neutronMassAbsorption')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.neutronMassAbsorption || '') })}
            isHtml={true}
          />
        </div>

        {/* Isotope information - displayed as a column if available */}
        <PropertyItem
          label={t('periodicTable.periodicTable.var.knownIsotopes')}
          value={createAtomIsotopeTag(element.atomicProperties?.symbol || '', element.atomicProperties?.knownIsotopes)}
          isHtml={true}
        />
        <PropertyItem
          label={t('periodicTable.periodicTable.var.stableIsotopes')}
          value={createAtomIsotopeTag(element.atomicProperties?.symbol || '', element.atomicProperties?.stableIsotopes)}
          isHtml={true}
        />
        <PropertyItem
          label={t('periodicTable.periodicTable.var.isotopicAbundances')}
          value={getIsotopeAbundance(element.atomicProperties?.symbol || '', element.atomicProperties?.isotopicAbundances)}
          isHtml={true}
        />
      </div>
    </CardSection>
  )
}