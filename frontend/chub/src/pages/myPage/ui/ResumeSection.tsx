import { useState } from "react";
import { useMyResume, useDeleteResume } from "@/entities/resume/api/query";
import { ResumeUploadForm } from "@/pages/myPage/ui/ResumeUploadForm";
import { ResumePreviewModal } from "@/pages/myPage/ui/ResumePreviewModal";
import Card from "@/shared/ui/Card";

export function ResumeSection() {
  const { data, isLoading, refetch } = useMyResume();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { mutate: deleteResume, isPending: isDeleting } = useDeleteResume();

  const handleUploadSuccess = () => {
    refetch();
  };

  const handleDownload = () => {
    if (data?.data?.pdfUrl) {
      window.open(data.data.pdfUrl, "_blank");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    deleteResume(undefined, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        refetch();
      },
      onError: (err) => {
        console.error("이력서 삭제 실패:", err);
        alert("이력서 삭제에 실패했습니다. 다시 시도해주세요.");
      },
    });
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">이력서</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </Card>
    );
  }

  const hasResume = data?.success && data?.data?.pdfUrl;

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">이력서</h2>
          {hasResume && data.data && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                title="다운로드"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="삭제"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {hasResume && data.data ? (
          <div className="space-y-4">
            {/* 이력서 카드 */}
            <div
              onClick={() => setShowPreviewModal(true)}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                  <div>
                    <h3 className="font-semibold text-gray-800">내 이력서</h3>
                    <p className="text-sm text-gray-500">PDF 파일</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-medium text-point">눌러서 미리보기</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ResumeUploadForm onUploadSuccess={handleUploadSuccess} />
        )}
      </Card>

      {/* 미리보기 모달 */}
      {showPreviewModal && hasResume && data.data && (
        <ResumePreviewModal
          pdfUrl={data.data.pdfUrl}
          resumeName="내 이력서"
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">이력서 삭제</h3>
            <p className="text-gray-600 mb-6">
              정말로 이력서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
