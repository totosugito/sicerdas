import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useAdminUserList = (params: { sort?: string; order?: 'asc' | 'desc'; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['admin-user-list', params.sort, params.order, params.page, params.limit],
        queryFn: async () => {
            const response = await fetchApi({ method: "GET", url: `${AppApi.user.admin.list}`, withCredentials: true, params: params });
            return (response);
        },
    });
}
