import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { ElementDetail } from '@/api/periodic-table/periodic-table';
import { CardSection } from './CardSection';
import { PropertyItemHtml } from './PropertyItemHtml';

interface ElementNotesProps {
  element: ElementDetail;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}

export const ElementNotes: React.FC<ElementNotesProps> = ({
  element,
  expandedSections,
  toggleSection
}) => {
  const { t } = useTranslation();

  return (
    <CardSection
      title={t('periodicTable.periodicTable.var.notes')}
      icon={<FileText className="h-5 w-5" />}
      isExpanded={expandedSections.notes}
      onToggle={() => toggleSection('notes')}
    >
      <div className='flex flex-col gap-4'>
        <PropertyItemHtml
          label={t('periodicTable.periodicTable.var.atomicOverview')}
          value={element.notes?.atomicOverview}
        />
        <PropertyItemHtml
          label={t('periodicTable.periodicTable.var.atomicHistory')}
          value={element.notes?.atomicHistory}
        />
        <PropertyItemHtml
          label={t('periodicTable.periodicTable.var.atomicApps')}
          value={element.notes?.atomicApps}
        />
        <PropertyItemHtml
          label={t('periodicTable.periodicTable.var.atomicFacts')}
          value={element.notes?.atomicFacts}
        />
      </div>
    </CardSection>
  );
};