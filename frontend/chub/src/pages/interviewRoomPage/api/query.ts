import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getInterviewSession,
    startInterview,
    submitInterviewAnswer,
    completeInterview,
    type InterviewAnswer,
} from "@/pages/interviewRoomPage/api/requests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

/**
 * 면접 세션 조회 hook
 */
export function useInterviewSession(roomID: number | undefined) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["interview", "room", roomID],
        queryFn: () => getInterviewSession(roomID!),
        staleTime: THIRTY_MINUTES_IN_MS,
        retry: false,
        enabled: !!roomID,
    });

    return { data, isLoading, error };
}

/**
 * 면접 시작 hook
 */
export function useStartInterview() {
    const queryClient = useQueryClient();

    const { mutate, isPending, error, isSuccess } = useMutation({
        mutationFn: (roomID: number) => startInterview(roomID),
        onSuccess: (_, roomID) => {
            queryClient.invalidateQueries({
                queryKey: ["interview", "room", roomID],
            });
        },
    });

    return { mutate, isPending, error, isSuccess };
}

/**
 * 답변 제출 hook
 */
export function useSubmitInterviewAnswer() {
    const queryClient = useQueryClient();

    const { mutate, isPending, error, isSuccess } = useMutation({
        mutationFn: ({
            roomID,
            answer,
        }: {
            roomID: number;
            answer: InterviewAnswer;
        }) => submitInterviewAnswer(roomID, answer),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["interview", "room", variables.roomID],
            });
        },
    });

    return { mutate, isPending, error, isSuccess };
}

/**
 * 면접 완료 hook
 */
export function useCompleteInterview() {
    const queryClient = useQueryClient();

    const { mutate, isPending, error, isSuccess } = useMutation({
        mutationFn: (roomID: number) => completeInterview(roomID),
        onSuccess: (_, roomID) => {
            queryClient.invalidateQueries({
                queryKey: ["interview", "room", roomID],
            });
        },
    });

    return { mutate, isPending, error, isSuccess };
}

