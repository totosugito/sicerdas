import type { BaseResponse } from "@/api/types";

export const EnumPeriodicGroup = {
  headerEmpty: "headerEmpty",
  header: "header",
  empty: "empty",
  othernonmetals: "othernonmetals",
  noble_gases: "noble_gases",
  halogens: "halogens",
  metalloids: "metalloids",
  post_transition_metals: "post_transition_metals",
  transition_metals: "transition_metals",
  lanthanoids: "lanthanoids",
  actinoids: "actinoids",
  alkaline_earth_metals: "alkaline_earth_metals",
  alkali_metals: "alkali_metals",
} as const;
export type EnumPeriodicGroup =
  (typeof EnumPeriodicGroup)[keyof typeof EnumPeriodicGroup];

export interface ElementNote {
  localeCode: string;
  atomicOverview: string;
  atomicHistory: string;
  atomicApps: string;
  atomicFacts: string;
}

export interface NavigationData {
  prev?: {
    atomicNumber: number;
    atomicName: string;
    atomicGroup: string;
    atomicSymbol: string;
  };
  next?: {
    atomicNumber: number;
    atomicName: string;
    atomicGroup: string;
    atomicSymbol: string;
  };
}

export interface ElementImages {
  atomic: string;
  safety: string;
  spectrum: string;
}

export type AtomicProperties = {
  knownIsotopes?: number[];
  stableIsotopes?: number[];
  nfpaLabel?: string[];
  oxidationStates?: { s?: string; v?: number[] };
  isotopicAbundances?: { s: number; v: number }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface AtomicIsotopeItem {
  s: string;
  v: string[];
}

export interface ElementData {
  id: number;
  atomicNumber: number;
  atomicGroup: string;
  atomicName: string;
  atomicSymbol: string;
  atomicProperties: AtomicProperties;
  atomicIsotope: Record<string, AtomicIsotopeItem>;
  atomicExtra: Record<string, unknown>;
  atomicImages: ElementImages;
  notes?: ElementNote;
  navigation: NavigationData;
}

export interface PeriodicElementResponse<T = ElementData> extends BaseResponse {
  data: T;
}
