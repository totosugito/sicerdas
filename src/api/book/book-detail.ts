import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

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
