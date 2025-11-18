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
  const [currentPage, setCurrentPage] = useState<number>(1); // UI 표시용 (1-based)
  // API 요청은 0-based로 변환
  const { data: recruiterOverviewResponse } = useRecruiters(
    currentPage - 1,
    6,
    field || ""
  );
  const queryClient = useQueryClient();
  
  // 필터가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [field]);

  // 현재 페이지가 totalPages보다 크면 마지막 페이지로 이동
  useEffect(() => {
    if (recruiterOverviewResponse?.pageInfo) {
      const totalPages = recruiterOverviewResponse.pageInfo.totalPages;
      // pageInfo.page는 0-based이므로 1-based로 변환하여 비교
      const displayedPage = recruiterOverviewResponse.pageInfo.page + 1;
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    }
  }, [recruiterOverviewResponse, currentPage]);

  useEffect(() => {
    const preFetchRecruiters = () => {
      if (!recruiterOverviewResponse) return;
      // pageInfo.page는 0-based이므로 다음 페이지는 +1
      const nextPage0Based = recruiterOverviewResponse.pageInfo.page + 1;
      if (nextPage0Based >= recruiterOverviewResponse.pageInfo.totalPages) return;
      queryClient.prefetchQuery({
        queryKey: ["recruiters", nextPage0Based, 6, field || ""],
        queryFn: () => useRecruiters(nextPage0Based, 6, field),
      });
    };
    preFetchRecruiters();
  }, [recruiterOverviewResponse, currentPage, queryClient, field]);
  const recruiters = recruiterOverviewResponse?.data?.profiles;
  const pageInfo = recruiterOverviewResponse?.pageInfo;
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
      {recruiters && recruiters.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch justify-start w-full max-w-7xl gap-4">
            {recruiters.map((recruiter: RecruiterOverview) => (
              <RecruiterListItem key={recruiter.id} recruiterOverview={recruiter} />
            ))}
          </div>
          {totalPages && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          )}
        </>
      ) : (
        <div className="flex items-center justify-center w-full max-w-7xl py-12">
          <p className="text-gray-500 text-lg">면접관이 없습니다.</p>
        </div>
      )}
    </main>
  );
}

export default RecruiterListPage;
