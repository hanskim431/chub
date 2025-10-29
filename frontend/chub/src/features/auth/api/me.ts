import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getMe, postGuestLogin } from "@/entities/user/api/requests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

export function useMe() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: THIRTY_MINUTES_IN_MS,
    refetchInterval: THIRTY_MINUTES_IN_MS,
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
