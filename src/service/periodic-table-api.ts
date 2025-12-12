import { useQuery, UseQueryOptions } from "@tanstack/react-query";
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

export interface PeriodicElement {
  atomicId: number;
  idx: number;
  idy: number;
  atomicNumber: number;
  atomicGroup: string;
  atomicName: string;
  atomicSymbol: string;
  atomicProperties: Record<string, unknown>;
  atomicIsotope: Record<string, unknown>;
  atomicExtra: Record<string, unknown>;
  notes?: PeriodicElementNote;
}

interface GetElementParams {
  atomicNumber: number;
  locale?: string;
}

type PeriodicElementQueryOptions = Omit<UseQueryOptions<PeriodicElement>, 'queryKey' | 'queryFn'>;

// Queries
export const usePeriodicElementQuery = (
  { atomicNumber, locale = 'en' }: GetElementParams,
  options?: PeriodicElementQueryOptions
) => {
  return useQuery<PeriodicElement>({
    queryKey: ['periodicElement', atomicNumber, locale],
    queryFn: async () => {
      const url = `${AppApi.periodicTable.element}/${atomicNumber}?locale=${locale}`;
      const response = await fetchApi({ method: "GET", url });
      return response.data;
    },
    ...options // Merge in any additional options
  });
}