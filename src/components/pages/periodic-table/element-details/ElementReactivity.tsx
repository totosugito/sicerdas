import { useTranslation } from 'react-i18next'
import { Flame } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { ElementDetail } from '@/api/periodic-table-api'
import { toPhysics } from '@/lib/my-utils'

interface ElementReactivityProps {
  element: ElementDetail
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementReactivity({ element, expandedSections, toggleSection }: ElementReactivityProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.reactivity')}
      icon={<Flame className="h-5 w-5" />}
      isExpanded={expandedSections.reactivity}
      onToggle={() => toggleSection('reactivity')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem
            label={t('periodicTable.periodicTable.var.valence')}
            value={element.atomicProperties?.valence || ''}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.electronegativity')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.electronegativity || '') })}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.electronAffinity')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.electronAffinity || '') })}
            isHtml={true}
            unit={getPeriodictUnits('electronAffinity')}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.electronegativityPaulingScale')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.electronegativityPaulingScale || '') })}
            isHtml={true}
          />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.electronegativityAllenScale')}
            value={toPhysics({ value: parseFloat(element.atomicProperties?.electronegativityAllenScale || '') })}
            isHtml={true}
          />
        </div>

        {/* Ionization Energies - displayed as a column if available */}
        <PropertyItem
          label={t('periodicTable.periodicTable.var.ionizationEnergies')}
          value={element.atomicProperties?.ionizationEnergies?.replaceAll(' kJ/mol', '')}
          unit={getPeriodictUnits('ionizationEnergies')}
        />
      </div>
    </CardSection>
  )
}