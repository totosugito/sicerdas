export interface PeriodicElement {
  atomicId: number;
  idx: number;
  idy: number;
  atomicNumber: number;
  atomicGroup: string;
  atomicName: string;
  atomicSymbol: string;
  prop?: {
    atomicWeight: string;
    phase: string;
    group: string;
    period: string;
    block: string;
    series: string;
    color: string;
    numberOfElectron: string;
    meltingPoint: string;
    boilingPoint: string;
    density: string;
    molarVolume: string;
    bulkModulus: string;
    shearModulus: string;
    youngModulus: string;
    electronegativity: string;
    electricalConductivity: string;
    resistivity?: string;
    atomicRadius?: string;
    vanDerWaalsRadius?: string;
  };
}

export interface PropertyDefinition {
  key: string;
  label?: string;
  unit?: string;
}

export type SortDirection = 'asc' | 'desc' | 'none';