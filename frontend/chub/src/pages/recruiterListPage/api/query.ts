import { getRecruiters } from "@/pages/recruiterListPage/api/requests";
import { useQuery } from "@tanstack/react-query";
import { getMyRecruiterDetail } from "@/pages/recruiterListPage/api/requests";
const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

export function useRecruiters(page: number, size: number, field: string) {
  const { data } = useQuery({
    queryKey: ["recruiters", page, size, field],
    queryFn: () => getRecruiters({ page, size, field }),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
  return { data };
}

export function useMyRecruiterDetail(id: string) {
  const { data } = useQuery({
    queryKey: ["myRecruiterDetail", id],
    queryFn: () => getMyRecruiterDetail(id),
    staleTime: THIRTY_MINUTES_IN_MS,
    refetchInterval: THIRTY_MINUTES_IN_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
  return { data };
}
