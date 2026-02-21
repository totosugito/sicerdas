import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const getSession = async () => {
    try {
        const response = await fetchApi({ method: "GET", url: AppApi.auth.getSession });
        return response;
    } catch (error) {
        return { token: null, user: null };
    }
};
