import { useState } from "react";
import { useMyResumeList } from "@/entities/resume/api/query";
import { ResumePreviewModal } from "@/pages/myPage/ui/ResumePreviewModal";
import { ResumeUploadForm } from "@/pages/myPage/ui/ResumeUploadForm";
import Card from "@/shared/ui/Card";
import type { ResumeItem } from "@/entities/resume/model/types";

export function ResumeList() {
  const { data, isLoading, refetch } = useMyResumeList();
  const [selectedResume, setSelectedResume] = useState<ResumeItem | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleUploadSuccess = () => {
    refetch();
    setShowUploadForm(false);
  };

  const handleResumeClick = (resume: ResumeItem) => {
    setSelectedResume(resume);
  };

  const handleCloseModal = () => {
    setSelectedResume(null);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">이력서 목록</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </Card>
    );
  }

  const resumes = data?.data?.resumes || [];

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">이력서 목록</h2>
          <button
            type="button"
            onClick={() => setShowUploadForm(true)}
            className="px-4 py-2 bg-point text-white rounded-md hover:bg-point-500 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            이력서 추가
          </button>
        </div>

        {showUploadForm ? (
          <div className="mt-4">
            <ResumeUploadForm
              onUploadSuccess={handleUploadSuccess}
              onCancel={() => setShowUploadForm(false)}
            />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg mb-2">등록된 이력서가 없습니다</p>
            <p className="text-sm">이력서를 추가하여 시작하세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => handleResumeClick(resume)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate mb-1">
                      {resume.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(resume.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      클릭하여 미리보기
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 미리보기 모달 */}
      {selectedResume && (
        <ResumePreviewModal
          pdfUrl={selectedResume.pdfUrl}
          resumeName={selectedResume.name}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

