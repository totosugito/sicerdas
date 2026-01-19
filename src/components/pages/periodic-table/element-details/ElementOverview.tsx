import { useTranslation } from 'react-i18next'
import { Atom } from 'lucide-react'
import { CardSection, PropertyItem } from './index'
import { getPeriodictUnits } from '../utils/element-units'
import { getDiscoveryYear, getElectronShell, getElectronShellValue, getElementImage } from '../utils/element'
import { toPhysics } from '@/lib/my-utils'
import { ElementDetail } from '@/api/periodic-table-api'
import { ElectronShell } from './ElectronShell'

interface ViewElementOverviewProps {
  element: ElementDetail
  atomColor: string
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function ElementOverview({ element, atomColor, expandedSections, toggleSection }: ViewElementOverviewProps) {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.overview')}
      icon={<Atom className="h-5 w-5" />}
      isExpanded={expandedSections.overview}
      onToggle={() => toggleSection('overview')}
    >
      <div className='flex flex-col gap-2'>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
          <PropertyItem label={t('periodicTable.periodicTable.var.atomicNumber')} value={element.atomicProperties?.atomicNumber} />
          <PropertyItem label={t('periodicTable.periodicTable.var.symbol')} value={element.atomicProperties?.symbol} />
          <PropertyItem label={t('periodicTable.periodicTable.var.name')} value={element.atomicProperties?.name} />
          <PropertyItem label={t('periodicTable.periodicTable.var.latinName')} value={element.atomicProperties?.latinName} />
          <PropertyItem label={t('periodicTable.periodicTable.var.discovery')} value={element.atomicProperties?.discovery} />
          <PropertyItem label={t('periodicTable.periodicTable.var.discoveryYear')}
            value={getDiscoveryYear(element.atomicProperties?.discoveryYear || "",
              t('periodicTable.elementDetail.bcYear'))} />
          <PropertyItem label={t('periodicTable.periodicTable.var.discoveryCountry')} value={element.atomicProperties?.discoveryCountry} />
          <PropertyItem
            label={t('periodicTable.periodicTable.var.atomicWeight')}
            value={toPhysics({ value: parseFloat(element.atomicProperties.atomicWeight || '') })}
            unit={getPeriodictUnits('atomicWeight')}
            isHtml={true}
          />
        </div>
        {element.atomicProperties?.atomicSpectra && element.atomicProperties?.atomicSpectra.length > 0 && (
          <div className="flex flex-col gap-2">
            <PropertyItem label={t('periodicTable.periodicTable.var.emissionSpectrum')} value={undefined} />
            <div className="sm:h-14 h-10">
              <img
                src={getElementImage({ element: `${element.atomicNumber}.${element.atomicName.toLowerCase()}`, type: 'spectrum', extension: 'png' })}
                alt=""
                className="h-full object-contain"
              />
            </div>
          </div>
        )}
        <PropertyItem label={t('periodicTable.periodicTable.var.electronShell')} value={getElectronShell(element.atomicProperties?.electronShell)} />
        <ElectronShell
          atomSymbol={element.atomicProperties?.symbol || ''}
          atomColor={atomColor}
          electrons={getElectronShellValue(element.atomicProperties?.electronShell)} />
      </div>
    </CardSection>
  )
}