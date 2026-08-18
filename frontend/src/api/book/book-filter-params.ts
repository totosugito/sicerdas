import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { FilterParamsResponse } from "./types";

export type { FilterParamsData as FilterParamCategory } from "./types";

export const useBookFilterParams = () => {
  return useQuery({
    queryKey: ["book-filter-params"],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.book.filterParams,
      });
      return response as FilterParamsResponse;
    },
  });
};
