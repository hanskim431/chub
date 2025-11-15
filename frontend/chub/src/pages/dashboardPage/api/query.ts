import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "./requests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

export function useDashboardStats() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: getDashboardStats,
        staleTime: THIRTY_MINUTES_IN_MS,
        refetchInterval: THIRTY_MINUTES_IN_MS,
        retry: false,
    });

    return { data, isLoading, error };
}
