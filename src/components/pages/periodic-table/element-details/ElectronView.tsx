import { useTranslation } from 'react-i18next';
import { ElementDetail } from '@/service/periodic-table-api';

interface ElectronViewProps {
  element: ElementDetail;
}

export const ElectronView = ({ element }: ElectronViewProps) => {
  const { t } = useTranslation();

  const numberOfElectrons = element.atomicProperties.numberOfElectron;
  const numberOfNeutrons = element.atomicProperties.numberOfNeutron;
  
  return (
    <div className="py-6">
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
        {/* Electrons Card */}
        <div className="flex flex-col items-center">
          <div className="w-20 rounded-lg bg-gradient-to-br from-red-500 to-red-700 dark:from-red-600 dark:to-red-800 flex flex-col items-center justify-center shadow-md transform transition-transform hover:scale-[1.03] border border-red-400/30 dark:border-red-500/30 p-2">
            <div className="text-center">
              <div className="text-white text-xs font-semibold mb-1 opacity-90">
                {t('periodicTable.elementDetail.electrons', 'Electrons')}
              </div>
              <div className="text-white text-xl font-bold">
                {numberOfElectrons}
              </div>
            </div>
          </div>
        </div>

        {/* Protons Card */}
        <div className="flex flex-col items-center">
          <div className="w-20 rounded-lg bg-gradient-to-br from-green-500 to-green-700 dark:from-green-600 dark:to-green-800 flex flex-col items-center justify-center shadow-md transform transition-transform hover:scale-[1.03] border border-green-400/30 dark:border-green-500/30 p-2">
            <div className="text-center">
              <div className="text-white text-xs font-semibold mb-1 opacity-90">
                {t('periodicTable.elementDetail.protons', 'Protons')}
              </div>
              <div className="text-white text-xl font-bold">
                {numberOfElectrons}
              </div>
            </div>
          </div>
        </div>

        {/* Neutrons Card */}
        <div className="flex flex-col items-center">
          <div className="w-20 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 flex flex-col items-center justify-center shadow-md transform transition-transform hover:scale-[1.03] border border-blue-400/30 dark:border-blue-500/30 p-2">
            <div className="text-center">
              <div className="text-white text-xs font-semibold mb-1 opacity-90">
                {t('periodicTable.elementDetail.neutrons', 'Neutrons')}
              </div>
              <div className="text-white text-xl font-bold">
                {numberOfNeutrons}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};