import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useBookList = () => {
  return useMutation({
    mutationKey: ['book-list'],
    mutationFn: async (body: Record<string, any>) => {
      const response = await fetchApi({method: "POST", url: `${AppApi.book.list}`, body: body, withCredentials: true});
      return(response);
    },
  });
}

export const useBookDetail = (bookId: string) => {
  return useQuery({
    queryKey: ['book-detail', bookId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET", 
        url: `${AppApi.book.detail}/${bookId}`, 
        withCredentials: true
      });
      return response;
    },
    enabled: !!bookId,
  });
}

// Types for filter parameters
export interface FilterParamGroup {
  id: number;
  name: string;
  desc?: string;
  status: string;
  stats: {
    bookTotal: number;
  };
}

export interface FilterParamCategory {
  id: number;
  code: string;
  name: string;
  desc?: string;
  status: string;
  groups: FilterParamGroup[];
}

export interface FilterParamsResponse {
  success: boolean;
  data: FilterParamCategory[];
}

export const useBookFilterParams = () => {
  return useQuery<FilterParamsResponse>({
    queryKey: ['book-filter-params'],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET", 
        url: `${AppApi.book.filterParams}`, 
        withCredentials: true
      });
      return response;
    },
  });
}