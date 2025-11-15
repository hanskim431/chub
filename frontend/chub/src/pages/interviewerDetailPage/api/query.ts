import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInterviewerDetail, createInterviewRequest, type CreateInterviewRequestRequest } from "@/pages/interviewerDetailPage/api/requests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

/**
 * 면접관 상세 정보 조회 hook
 */
export function useInterviewerDetail(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["interviewer", "detail", id],
    queryFn: () => getInterviewerDetail(id),
    staleTime: THIRTY_MINUTES_IN_MS,
    retry: false,
    enabled: !!id,
  });

  return { data, isLoading, error };
}

export function useCreateInterviewRequest() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateInterviewRequestRequest) =>
      createInterviewRequest(data),
    onSuccess: () => {
      // 면접 신청 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["interviewRequests"] });
    },
  });

  return mutation;
}
