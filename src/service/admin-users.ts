import {useMutation, useQuery, UseQueryOptions} from "@tanstack/react-query";
import {fetchApi} from "@/lib/fetch-api";
import {AppApi} from "@/constants/api";

export const useAdminUserList = (params: { sort?: string; order?: 'asc' | 'desc'; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin-user-list', params.sort, params.order, params.page, params.limit],
    queryFn: async () => {
      const response = await fetchApi({method: "GET", url: `${AppApi.admin.user.list}`, withCredentials: true, params: params});
      return(response);
    },
  });
}

export const useAdminUserCreate = () => {
  return useMutation({
    mutationKey: ['admin-user-create'],
    mutationFn: async ({body}: { body: any }) => {
      return await fetchApi({method: "POST", url: `${AppApi.admin.user.create}`, body: body, withCredentials: true});
    },
  });
}

export const useAdminUserPut = () => {
  return useMutation({
    mutationKey: ['admin-user-put'],
    mutationFn: async ({id, body}: {id: string, body: any }) => {
      return await fetchApi({method: "PUT", url: (AppApi.admin.user.crud).replace(':id', id), body: body, withCredentials: true});
    },
  });
}

export const useAdminUserDelete = () => {
  return useMutation({
    mutationKey: ['admin-user-delete'],
    mutationFn: async ({body}: { body: any }) => {
      return await fetchApi({method: "DELETE", url: `${AppApi.admin.user.delete}`, body: body, withCredentials: true});
    },
  });
}

export const useAdminChangePassword = () => {
  return useMutation({
    mutationKey: ['admin-user-change-password'],
    mutationFn: async ({id, body}: { id: string, body: Record<string, any> }) => {
      return await fetchApi({method: "PATCH", url: (AppApi.admin.user.changePassword).replace(':id', id), body: body, withCredentials: true});
    },
  });
}