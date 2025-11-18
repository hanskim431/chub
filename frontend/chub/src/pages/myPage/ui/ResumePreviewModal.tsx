import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumePreviewModalProps {
    pdfUrl: string;
    resumeName: string;
    onClose: () => void;
}

export function ResumePreviewModal({
    pdfUrl,
    resumeName,
    onClose,
}: ResumePreviewModalProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const handleDownload = () => {
        window.open(pdfUrl, "_blank");
    };

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

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {resumeName}
                    </h2>
                    <div className="flex items-center gap-2">
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
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* PDF 뷰어 */}
                <div className="flex-1 overflow-auto p-4 bg-gray-100">
                    <div className="flex flex-col items-center">
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex items-center justify-center h-96">
                                    <div className="text-gray-500">
                                        PDF 로딩 중...
                                    </div>
                                </div>
                            }
                            error={
                                <div className="flex items-center justify-center h-96">
                                    <div className="text-red-500">
                                        PDF 로딩에 실패했습니다.
                                    </div>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                width={Math.min(800, window.innerWidth - 64)}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            />
                        </Document>
                    </div>
                </div>

                {/* 페이지 네비게이션 */}
                {numPages > 0 && (
                    <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-200">
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
            </div>
        </div>
    );
}
