import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";

export const ElementNoteItem = Type.Object({
  localeCode: Type.String(),
  atomicOverview: Type.String(),
  atomicHistory: Type.String(),
  atomicApps: Type.String(),
  atomicFacts: Type.String(),
});

export const NavigationItem = Type.Object({
  atomicNumber: Type.Integer(),
  atomicName: Type.String(),
  atomicGroup: Type.String(),
  atomicSymbol: Type.String(),
});

export const ElementImagesItem = Type.Object({
  atomic: Type.String(),
  safety: Type.String(),
  spectrum: Type.String(),
});

export const OxidationStatesSchema = Type.Object({
  s: Type.Optional(Type.String()),
  v: Type.Optional(Type.Array(Type.Number())),
});

export const IsotopicAbundanceSchema = Type.Object({
  s: Type.Number(),
  v: Type.Number(),
});

export const AtomicPropertiesSchema = Type.Object({
  name: Type.Optional(Type.String()),
  block: Type.Optional(Type.String()),
  color: Type.Optional(Type.String()),
  group: Type.Optional(Type.String()),
  inChI: Type.Optional(Type.String()),
  phase: Type.Optional(Type.String()),
  period: Type.Optional(Type.String()),
  series: Type.Optional(Type.String()),
  symbol: Type.Optional(Type.String()),
  density: Type.Optional(Type.String()),
  valence: Type.Optional(Type.String()),
  gasPhase: Type.Optional(Type.String()),
  halfLife: Type.Optional(Type.String()),
  inChiKey: Type.Optional(Type.String()),
  lifetime: Type.Optional(Type.String()),
  casNumber: Type.Optional(Type.String()),
  cidNumber: Type.Optional(Type.String()),
  decayMode: Type.Optional(Type.String()),
  discovery: Type.Optional(Type.String()),
  latinName: Type.Optional(Type.String()),
  neelPoint: Type.Optional(Type.String()),
  nfpaLabel: Type.Optional(Type.Array(Type.String())),
  percInSun: Type.Optional(Type.String()),
  curiePoint: Type.Optional(Type.String()),
  dOTNumbers: Type.Optional(Type.String()),
  bulkModulus: Type.Optional(Type.String()),
  groundLevel: Type.Optional(Type.String()),
  molarVolume: Type.Optional(Type.String()),
  percInEarth: Type.Optional(Type.String()),
  percInEarthsCrust: Type.Optional(Type.String()),
  resistivity: Type.Optional(Type.String()),
  rtecsNumber: Type.Optional(Type.String()),
  atomicNumber: Type.Optional(Type.String()),
  atomicRadius: Type.Optional(Type.String()),
  atomicWeight: Type.Optional(Type.String()),
  boilingPoint: Type.Optional(Type.String()),
  heatOfFusion: Type.Optional(Type.String()),
  magneticType: Type.Optional(Type.String()),
  meltingPoint: Type.Optional(Type.String()),
  mohsHardness: Type.Optional(Type.String()),
  percInHumans: Type.Optional(Type.String()),
  percInOceans: Type.Optional(Type.String()),
  poissonRatio: Type.Optional(Type.String()),
  shearModulus: Type.Optional(Type.String()),
  specificHeat: Type.Optional(Type.String()),
  speedOfSound: Type.Optional(Type.String()),
  youngModulus: Type.Optional(Type.String()),
  atomicSpectra: Type.Optional(Type.String()),
  densityLiquid: Type.Optional(Type.String()),
  discoveryYear: Type.Optional(Type.String()),
  electronShell: Type.Optional(Type.String()),
  knownIsotopes: Type.Optional(Type.Array(Type.Number())),
  latticeAngles: Type.Optional(Type.String()),
  adiabaticIndex: Type.Optional(Type.String()),
  alternateNames: Type.Optional(Type.String()),
  covalentRadius: Type.Optional(Type.String()),
  dOTHazardClass: Type.Optional(Type.String()),
  electricalType: Type.Optional(Type.String()),
  percInUniverse: Type.Optional(Type.String()),
  quantumNumbers: Type.Optional(Type.String()),
  spaceGroupName: Type.Optional(Type.String()),
  stableIsotopes: Type.Optional(Type.Array(Type.Number())),
  brinellHardness: Type.Optional(Type.String()),
  oxidationStates: Type.Optional(OxidationStatesSchema),
  refractiveIndex: Type.Optional(Type.String()),
  vickersHardness: Type.Optional(Type.String()),
  criticalPressure: Type.Optional(Type.String()),
  crystalStructure: Type.Optional(Type.String()),
  discoveryCountry: Type.Optional(Type.String()),
  electronAffinity: Type.Optional(Type.String()),
  emissionSpectrum: Type.Optional(Type.String()),
  latticeConstants: Type.Optional(Type.String()),
  numberOfElectron: Type.Optional(Type.Number()),
  numberOfNeutron: Type.Optional(Type.String()),
  percInMeteorites: Type.Optional(Type.String()),
  spaceGroupNumber: Type.Optional(Type.String()),
  thermalExpansion: Type.Optional(Type.String()),
  electronegativity: Type.Optional(Type.String()),
  namesOfAllotropes: Type.Optional(Type.String()),
  vanDerWaalsRadius: Type.Optional(Type.String()),
  heatOfVaporization: Type.Optional(Type.String()),
  ionizationEnergies: Type.Optional(Type.String()),
  isotopicAbundances: Type.Optional(Type.Array(IsotopicAbundanceSchema)),
  criticalTemperature: Type.Optional(Type.String()),
  neutronCrossSection: Type.Optional(Type.String()),
  physicalDescription: Type.Optional(Type.String()),
  thermalConductivity: Type.Optional(Type.String()),
  absoluteBoilingPoint: Type.Optional(Type.String()),
  absoluteMeltingPoint: Type.Optional(Type.String()),
  superconductingPoint: Type.Optional(Type.String()),
  electronConfiguration: Type.Optional(Type.String()),
  empiricalAtomicRadius: Type.Optional(Type.String()),
  neutronMassAbsorption: Type.Optional(Type.String()),
  electricalConductivity: Type.Optional(Type.String()),
  estimatedCrustalAbundance: Type.Optional(Type.String()),
  estimatedOceanicAbundance: Type.Optional(Type.String()),
  massMagneticSusceptibility: Type.Optional(Type.String()),
  electronegativityAllenScale: Type.Optional(Type.String()),
  molarMagneticSusceptibility: Type.Optional(Type.String()),
  volumeMagneticSusceptibility: Type.Optional(Type.String()),
  electronegativityPaulingScale: Type.Optional(Type.String()),
  getKnownIsotopes: Type.Optional(Type.String()),
  getStableIsotopes: Type.Optional(Type.String()),
  getIsotopeAbundance: Type.Optional(Type.String()),
  absolute: Type.Optional(Type.String()),
});

export const AtomicIsotopeItemSchema = Type.Object({
  s: Type.String(),
  v: Type.Array(Type.String()),
});

export const ElementResponseItem = Type.Object({
  id: Type.Integer(),
  atomicNumber: Type.Integer(),
  atomicGroup: Type.String(),
  atomicName: Type.String(),
  atomicSymbol: Type.String(),
  atomicProperties: AtomicPropertiesSchema,
  atomicIsotope: Type.Record(Type.String(), AtomicIsotopeItemSchema),
  atomicExtra: Type.Record(Type.String(), Type.Unknown()),
  notes: Type.Optional(ElementNoteItem),
  atomicImages: ElementImagesItem,
  navigation: Type.Object({
    prev: Type.Optional(NavigationItem),
    next: Type.Optional(NavigationItem),
  }),
});

export const ElementResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: ElementResponseItem,
  }),
]);

export type ElementData = Static<typeof ElementResponseItem>;
export type ElementNote = Static<typeof ElementNoteItem>;
export type NavigationData = Static<typeof NavigationItem>;
export type ElementImages = Static<typeof ElementImagesItem>;
export type AtomicProperties = Static<typeof AtomicPropertiesSchema>;
export type AtomicIsotopeItem = Static<typeof AtomicIsotopeItemSchema>;
