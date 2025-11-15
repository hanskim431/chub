import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
    getMe,
    postGuestLogin,
    updateUser,
} from "@/entities/user/api/requests";

export function useMe() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: false,
    });
    return { data, isLoading, error, refetch };
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

export function useUpdateUser() {
    const queryClient = useQueryClient();
    const { mutate, isPending, error, isSuccess } = useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
    return { mutate, isPending, error, isSuccess };
}
