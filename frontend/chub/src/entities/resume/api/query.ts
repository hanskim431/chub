import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyResume, uploadOrUpdateResume, deleteMyResume, getUserResume } from "@/entities/resume/api/requests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

/**
 * 내 이력서 조회 hook
 */
export function useMyResume() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resume", "me"],
    queryFn: getMyResume,
    staleTime: THIRTY_MINUTES_IN_MS,
    retry: false,
  });

  return { data, isLoading, error, refetch };
}

/**
 * 이력서 업로드/수정 hook
 */
export function useUploadResume() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: uploadOrUpdateResume,
    onSuccess: () => {
      // 이력서 조회 쿼리 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["resume", "me"] });
    },
  });

  return { mutate, isPending, error, isSuccess };
}

/**
 * 이력서 삭제 hook
 */
export function useDeleteResume() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: deleteMyResume,
    onSuccess: () => {
      // 이력서 조회 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["resume", "me"] });
    },
  });

  return { mutate, isPending, error, isSuccess };
}

/**
 * 특정 사용자의 이력서 조회 hook
 */
export function useUserResume(userId: number | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["resume", "user", userId],
    queryFn: () => getUserResume(userId!),
    staleTime: THIRTY_MINUTES_IN_MS,
    retry: false,
    enabled: !!userId,
  });

  return { data, isLoading, error };
}
