import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getMe, postGuestLogin } from "@/entities/user/api/requests";

export function useMe() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: false,
    });
    return { data, isLoading, error };
}

export function useGuestLogin() {
    const queryClient = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: postGuestLogin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
    return { mutate };
}
