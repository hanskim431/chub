import { useRecruiters } from "@/pages/recruiterListPage/api/query";
import RecruiterListItem from "@/pages/recruiterListPage/ui/RecruiterListItem";
import type { RecruiterOverview } from "@/mocks/model/constants";
import Pagination from "@/shared/ui/Pagination";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import RecruiterFilter from "@/pages/recruiterListPage/ui/RecruiterFilter";
import { useRecruiterFilterStore } from "@/pages/recruiterListPage/model/recruiterFilterStore";

function RecruiterListPage() {
  const field = useRecruiterFilterStore((state) => state.field);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data: recruiterOverviewResponse } = useRecruiters(
    currentPage,
    6,
    field || ""
  );
  const queryClient = useQueryClient();
  useEffect(() => {
    const preFetchRecruiters = () => {
      if (!recruiterOverviewResponse) return;
      const nextPage = recruiterOverviewResponse.data.pageInfo.page + 1;
      if (nextPage > recruiterOverviewResponse.data.pageInfo.totalPages) return;
      queryClient.prefetchQuery({
        queryKey: ["recruiters", nextPage, 6, field || ""],
        queryFn: () => useRecruiters(nextPage, 6, field),
      });
    };
    preFetchRecruiters();
  }, [recruiterOverviewResponse, currentPage, queryClient]);
  const recruiters = recruiterOverviewResponse?.data?.recruiters;
  const pageInfo = recruiterOverviewResponse?.data?.pageInfo;
  const totalPages = pageInfo?.totalPages;

  return (
    <main
      aria-label="recruiter-list-page"
      className="bg-background flex w-full flex-col items-center justify-start gap-6 p-8 h-[calc(100vh-4rem)] overflow-y-auto"
    >
      <div className="flex flex-col items-start gap-2 justify-start w-full max-w-7xl">
        <h1 className="text-3xl font-bold text-text-black">면접관 찾기</h1>
        <h2 className="text-m font-medium ml-1 text-text-gray">
          나에게 맞는 면접관을 선택하고 실전처럼 피드백을 받아보세요.
        </h2>
      </div>
      <RecruiterFilter />
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch justify-start w-full max-w-7xl gap-4">
        {recruiters?.map((recruiter: RecruiterOverview) => (
          <RecruiterListItem key={recruiter.id} recruiterOverview={recruiter} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
      />
    </main>
  );
}

export default RecruiterListPage;
