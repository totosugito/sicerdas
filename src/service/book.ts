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
        url: `${AppApi.book.crud}/${bookId}`, 
        withCredentials: true
      });
      return response;
    },
    enabled: !!bookId,
  });
}