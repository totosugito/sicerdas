import { useTranslation } from 'react-i18next';
import { IsotopeCard } from './IsotopeCard';

interface IsotopeData {
  id: number;
  sIdentified: string;
  halfLife: string;
  spinParity: string;
  atomicWeight: string;
  abundance: string;
  massExcess: string;
  bindingEnergy: string;
  magneticMoment: string;
  quadrupoleMoment: string;
}

interface ElementIsotopeProps {
  atomColor: string;
  atomicSymbol: string
  knownIsotopes?: number[];
  isotopes: Record<string, { s: string; v: string[] }>;
}

// Helper to parse isotope data from knownIsotopes
const parseIsotopeData = (
  knownIsotopes: number[] | undefined,
  atomicIsotope: Record<string, { s: string; v: string[] }>
): IsotopeData[] => {
  if (!knownIsotopes || !Array.isArray(knownIsotopes)) {
    return [];
  }
  
  const result: IsotopeData[] = [];
  for (let i = 0; i < knownIsotopes.length; i++) {
    const id = knownIsotopes[i];
    const data = atomicIsotope[i.toString()];
    if (!data) {
      result.push({
        id,
        sIdentified: "",
        halfLife: "",
        spinParity: "",
        atomicWeight: "",
        abundance: "",
        massExcess: "",
        bindingEnergy: "",
        magneticMoment: "",
        quadrupoleMoment: "",
      });
    } else {
      result.push({
        id,
        sIdentified: data.s,
        halfLife: data.v[0] || "",
        spinParity: data.v[1] || "",
        atomicWeight: data.v[2] || "",
        abundance: data.v[3] || "",
        massExcess: data.v[4] || "",
        bindingEnergy: data.v[5] || "",
        magneticMoment: data.v[6] || "",
        quadrupoleMoment: data.v[7] || "",
      });
    }
  }
  return result;
};

export function ElementIsotope({ atomColor, atomicSymbol, knownIsotopes, isotopes }: ElementIsotopeProps) {
  const { t } = useTranslation();

  const atomicIsotopes = parseIsotopeData(knownIsotopes, isotopes);

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {atomicIsotopes.map((isotope) => (
        <IsotopeCard
          atomColor={atomColor}
          key={isotope.id}
          isotope={isotope}
          atomicSymbol={atomicSymbol}
        />
      ))}
    </div>

  );
}