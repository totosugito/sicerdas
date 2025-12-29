import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

// Types for periodic table element data
export interface PeriodicElementNote {
  localeCode: string;
  atomicOverview: string;
  atomicHistory: string;
  atomicApps: string;
  atomicFacts: string;
}

// Define the structure for atomic properties based on the JSON data
export interface AtomicProperties {
  name?: string;
  block?: string;
  color?: string;
  group?: string;
  inChI?: string;
  phase?: string;
  period?: string;
  series?: string;
  symbol?: string;
  density?: string;
  valence?: string;
  gasPhase?: string;
  halfLife?: string;
  inChiKey?: string;
  lifetime?: string;
  casNumber?: string;
  cidNumber?: string;
  decayMode?: string;
  discovery?: string;
  latinName?: string;
  neelPoint?: string;
  nfpaLabel?: string[];
  percInSun?: string;
  curiePoint?: string;
  dOTNumbers?: string;
  bulkModulus?: string;
  groundLevel?: string;
  molarVolume?: string;
  percInEarth?: string;
  percInEarthsCrust?: string;
  resistivity?: string;
  rtecsNumber?: string;
  atomicNumber?: string;
  atomicRadius?: string;
  atomicWeight?: string;
  boilingPoint?: string;
  heatOfFusion?: string;
  magneticType?: string;
  meltingPoint?: string;
  mohsHardness?: string;
  percInHumans?: string;
  percInOceans?: string;
  poissonRatio?: string;
  shearModulus?: string;
  specificHeat?: string;
  speedOfSound?: string;
  youngModulus?: string;
  atomicSpectra?: string;
  densityLiquid?: string;
  discoveryYear?: string;
  electronShell?: string;
  knownIsotopes?: number[];
  latticeAngles?: string;
  adiabaticIndex?: string;
  alternateNames?: string;
  covalentRadius?: string;
  dOTHazardClass?: string;
  electricalType?: string;
  percInUniverse?: string;
  quantumNumbers?: string;
  spaceGroupName?: string;
  stableIsotopes?: number[];
  brinellHardness?: string;
  oxidationStates?: {
    s?: string;
    v?: number[];
  };
  refractiveIndex?: string;
  vickersHardness?: string;
  criticalPressure?: string;
  crystalStructure?: string;
  discoveryCountry?: string;
  electronAffinity?: string;
  emissionSpectrum?: string;
  latticeConstants?: string;
  numberOfElectron?: number;
  numberOfNeutron?: string;
  percInMeteorites?: string;
  spaceGroupNumber?: string;
  thermalExpansion?: string;
  electronegativity?: string;
  namesOfAllotropes?: string;
  vanDerWaalsRadius?: string;
  heatOfVaporization?: string;
  ionizationEnergies?: string;
  isotopicAbundances?: Array<{ s: number; v: number }>;
  criticalTemperature?: string;
  neutronCrossSection?: string;
  physicalDescription?: string;
  thermalConductivity?: string;
  absoluteBoilingPoint?: string;
  absoluteMeltingPoint?: string;
  superconductingPoint?: string;
  electronConfiguration?: string;
  empiricalAtomicRadius?: string;
  neutronMassAbsorption?: string;
  electricalConductivity?: string;
  estimatedCrustalAbundance?: string;
  estimatedOceanicAbundance?: string;
  massMagneticSusceptibility?: string;
  electronegativityAllenScale?: string;
  molarMagneticSusceptibility?: string;
  volumeMagneticSusceptibility?: string;
  electronegativityPaulingScale?: string;
  getKnownIsotopes?: string;
  getStableIsotopes?: string;
  getIsotopeAbundance?: string;
  absolute?: string;
}

export interface ElementNavigation {
  atomicNumber: number;
  atomicName: string;
  atomicGroup: string;
  atomicSymbol: string;
}

export interface ElementNavigationData {
  prev?: ElementNavigation;
  next?: ElementNavigation;
}

export interface ElementDetail {
  atomicId: number;
  idx: number;
  idy: number;
  atomicNumber: number;
  atomicGroup: string;
  atomicName: string;
  atomicSymbol: string;
  atomicProperties: AtomicProperties;
  atomicIsotope: Record<string, { s: string; v: string[] }>;
  atomicExtra: Record<string, unknown>;
  notes?: PeriodicElementNote;
  navigation: ElementNavigationData;
}

interface GetElementParams {
  atomicNumber: number;
}

// Queries
interface GetElementParamsWithLanguage extends GetElementParams {
  language?: string;
}

export const usePeriodicElementQuery = (
  { atomicNumber, language }: GetElementParamsWithLanguage
) => {
  return useQuery<ElementDetail>({
    queryKey: ['periodicElement', atomicNumber, language],
    queryFn: async () => {
      const url = `${AppApi.periodicTable.element}/${atomicNumber}`;
      const response = await fetchApi({ method: "GET", url });
      return response.data;
    }
  });
};