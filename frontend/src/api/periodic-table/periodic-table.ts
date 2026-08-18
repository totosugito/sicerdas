import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { PeriodicElementResponse, ElementData } from "./types";

export type { ElementData } from "./types";

interface GetElementParamsWithLanguage {
  atomicNumber: number;
  language?: string;
}

export const usePeriodicElementQuery = (
  { atomicNumber, language }: GetElementParamsWithLanguage,
) => {
  return useQuery<ElementData>({
    queryKey: ["periodic-table-element", atomicNumber, language],
    queryFn: async () => {
      const url = `${AppApi.periodicTable.element}/${atomicNumber}`;
      const response = await fetchApi({ method: "GET", url });
      return (response as PeriodicElementResponse).data;
    },
  });
};
