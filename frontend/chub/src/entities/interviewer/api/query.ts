import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyInterviewerProfile,
  createInterviewerProfile,
  updateInterviewerProfile,
} from "./requests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

/**
 * 내 면접관 프로필 조회 hook
 */
export function useMyInterviewerProfile() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["interviewer", "profile", "me"],
    queryFn: getMyInterviewerProfile,
    staleTime: THIRTY_MINUTES_IN_MS,
    retry: false,
  });

  return { data, isLoading, error, refetch };
}

/**
 * 면접관 프로필 생성 hook
 */
export function useCreateInterviewerProfile() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: createInterviewerProfile,
    onSuccess: () => {
      // 프로필 조회 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["interviewer", "profile", "me"] });
    },
  });

  return { mutate, isPending, error, isSuccess };
}

/**
 * 면접관 프로필 수정 hook
 */
export function useUpdateInterviewerProfile() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: updateInterviewerProfile,
    onSuccess: () => {
      // 프로필 조회 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["interviewer", "profile", "me"] });
    },
  });

  return { mutate, isPending, error, isSuccess };
}
