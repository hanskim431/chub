import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useDeleteResume } from "@/entities/resume/api/query";

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumePdfViewerProps {
  pdfUrl: string;
  onDeleteSuccess: () => void;
}

export function ResumePdfViewer({
  pdfUrl,
  onDeleteSuccess,
}: ResumePdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { mutate: deleteResume, isPending: isDeleting } = useDeleteResume();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const handleDownload = () => {
    window.open(pdfUrl, "_blank");
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    deleteResume(undefined, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        onDeleteSuccess();
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

  return (
    <div className="space-y-4">
      {/* 액션 버튼들 */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
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
          다운로드
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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
          삭제
        </button>
      </div>

      {/* PDF 뷰어 */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">PDF 로딩 중...</div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-96">
              <div className="text-red-500">PDF 로딩에 실패했습니다.</div>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={Math.min(800, window.innerWidth - 64)}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="mx-auto"
          />
        </Document>
      </div>

      {/* 페이지 네비게이션 */}
      {numPages > 0 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="text-sm text-gray-700">
            {pageNumber} / {numPages}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
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
    </div>
  );
}
