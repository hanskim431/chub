import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getInterviewRequests,
    getReceivedInterviewRequests,
    getScheduledInterviews,
    updateInterviewRequestStatus,
    type GetInterviewRequestsParams,
} from "@/pages/dashboardPage/api/interviewRequests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

export function useInterviewRequests(params: GetInterviewRequestsParams) {
    const { data, isLoading, error } = useQuery({
        queryKey: [
            "interviewRequests",
            "me",
            params.status,
            params.page,
            params.size,
        ],
        queryFn: () => getInterviewRequests(params),
        staleTime: THIRTY_MINUTES_IN_MS,
        retry: false,
    });

    return { data, isLoading, error };
}

export function useReceivedInterviewRequests(
    page: number = 0,
    size: number = 10
) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["interviewRequests", "received", page, size],
        queryFn: () => getReceivedInterviewRequests({ page, size }),
        staleTime: THIRTY_MINUTES_IN_MS,
        retry: false,
    });

    return { data, isLoading, error };
}

export function useScheduledInterviews() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["interviews", "scheduled"],
        queryFn: getScheduledInterviews,
        staleTime: THIRTY_MINUTES_IN_MS,
        retry: false,
    });

    return { data, isLoading, error };
}

export function useUpdateInterviewRequestStatus() {
    const queryClient = useQueryClient();

    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ id, accepted }: { id: number; accepted: boolean }) =>
            updateInterviewRequestStatus(id, accepted),
        onSuccess: () => {
            // 받은 요청 목록과 내가 신청한 면접 목록 캐시 무효화
            queryClient.invalidateQueries({
                queryKey: ["interviewRequests", "received"],
            });
            queryClient.invalidateQueries({
                queryKey: ["interviewRequests", "me"],
            });
        },
    });

    return { mutate, isPending, error };
}
