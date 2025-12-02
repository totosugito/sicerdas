export interface PeriodicElement {
  atomicId: number;
  idx: number;
  idy: number;
  atomicNumber: number;
  atomicGroup: string;
  atomicName: string;
  atomicSymbol: string;
}

export interface PeriodicStyle {
  theme: string;
  cellSpacing: number;
  getColorBg: (group: string) => string;
}