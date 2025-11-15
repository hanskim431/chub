import { useQuery } from "@tanstack/react-query";
import { getInterviewRecord } from "@/pages/interviewRecordPage/api/requests";

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

export function useInterviewRecord(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["interviewRecord", id],
    queryFn: () => getInterviewRecord(id),
    staleTime: THIRTY_MINUTES_IN_MS,
    retry: false,
    enabled: !!id,
  });

  return { data, isLoading, error };
}

