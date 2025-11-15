import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    startPractice,
    getPracticeSession,
    submitAnswer,
    completePractice,
    type StartPracticeRequest,
    type PracticeAnswer,
} from "@/pages/interviewPracticePage/api/requests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

/**
 * 면접 연습 시작 hook
 */
export function useStartPractice() {
    const queryClient = useQueryClient();

    const { mutate, isPending, error, isSuccess } = useMutation({
        mutationFn: (data: StartPracticeRequest) => startPractice(data),
        onSuccess: (response) => {
            if (response?.data?.data) {
                queryClient.setQueryData(
                    ["practice", response.data.data.practiceId],
                    response.data
                );
            }
        },
    });

    return { mutate, isPending, error, isSuccess };
}

/**
 * 면접 연습 세션 조회 hook
 */
export function usePracticeSession(id: number | undefined) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["practice", id],
        queryFn: () => getPracticeSession(id!),
        staleTime: THIRTY_MINUTES_IN_MS,
        retry: false,
        enabled: !!id,
    });

    return { data, isLoading, error };
}

/**
 * 답변 제출 hook
 */
export function useSubmitAnswer() {
    const queryClient = useQueryClient();

    const { mutate, isPending, error, isSuccess } = useMutation({
        mutationFn: ({
            practiceId,
            answer,
        }: {
            practiceId: number;
            answer: PracticeAnswer;
        }) => submitAnswer(practiceId, answer),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["practice", variables.practiceId],
            });
        },
    });

    return { mutate, isPending, error, isSuccess };
}

/**
 * 면접 연습 완료 hook
 */
export function useCompletePractice() {
    const queryClient = useQueryClient();

    const { mutate, isPending, error, isSuccess } = useMutation({
        mutationFn: (practiceId: number) => completePractice(practiceId),
        onSuccess: (response, practiceId) => {
            queryClient.invalidateQueries({
                queryKey: ["practice", practiceId],
            });
        },
    });

    return { mutate, isPending, error, isSuccess };
}

