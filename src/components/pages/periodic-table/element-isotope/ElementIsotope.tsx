import { useTranslation } from 'react-i18next';
import { Atom } from 'lucide-react';

interface ElementIsotopeProps {
  isotopes: Record<string, unknown>;
}

interface AtomicIsotope {
  iId: number;
  sIdentified: string;
  vIdentified: string;
  halfLife: string;
  atomicWeight: string;
  abundance: string;
  massExcess: string;
  bindingEnergy: string;
  magneticMoment: string;
  quadrupoleMoment: string;
}

export function ElementIsotope({ isotopes }: ElementIsotopeProps) {
  const { t } = useTranslation();

  const parseIsotopeData = (isotopes: Record<string, unknown>): AtomicIsotope[] => {
    if (!isotopes || typeof isotopes !== 'object') {
      return [];
    }
    
    const isotopeEntries = Object.entries(isotopes);
    
    return isotopeEntries.map(([key, value], index) => {
      if (typeof value !== 'object' || value === null || !value.hasOwnProperty('s') || !value.hasOwnProperty('v')) {
        return {
          iId: parseInt(key) || index + 1,
          sIdentified: '',
          vIdentified: '',
          halfLife: '',
          atomicWeight: '',
          abundance: '',
          massExcess: '',
          bindingEnergy: '',
          magneticMoment: '',
          quadrupoleMoment: '',
        };
      }
      
      const isotopeValue = value as { s: string; v: string[] };
      const values = isotopeValue.v;
      return {
        iId: parseInt(key) || index + 1,
        sIdentified: isotopeValue.s || '',
        vIdentified: values[1] || '',
        halfLife: values[0] || '',
        atomicWeight: values[2] || '',
        abundance: values[3] || '',
        massExcess: values[4] || '',
        bindingEnergy: values[5] || '',
        magneticMoment: values[6] || '',
        quadrupoleMoment: values[7] || '',
      };
    });
  };

  const atomicIsotopes = parseIsotopeData(isotopes);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-2 p-3 bg-muted dark:bg-gray-900 text-left">
        <Atom className="w-5 h-5" />
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {t('periodic.isotope_data')}
        </span>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('periodic.isotope')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('periodic.half_life')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('periodic.spin_parity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('periodic.atomic_weight')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('periodic.abundance')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('periodic.mass_excess')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('periodic.binding_energy')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('periodic.magnetic_moment')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {atomicIsotopes.map((isotope) => (
                <tr key={isotope.iId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isotope.sIdentified}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isotope.halfLife}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isotope.vIdentified}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isotope.atomicWeight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isotope.abundance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isotope.massExcess}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isotope.bindingEnergy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isotope.magneticMoment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}