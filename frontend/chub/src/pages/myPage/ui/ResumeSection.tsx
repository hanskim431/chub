import { useMyResume } from "@/entities/resume/api/query";
import { ResumeUploadForm } from "./ResumeUploadForm";
import { ResumePdfViewer } from "./ResumePdfViewer";

export function ResumeSection() {
  const { data, isLoading, refetch } = useMyResume();

  const handleUploadSuccess = () => {
    refetch();
  };

  const handleDeleteSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">이력서</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  const hasResume = data?.success && data?.data?.pdfUrl;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">이력서</h2>

      {hasResume && data.data ? (
        <ResumePdfViewer
          pdfUrl={data.data.pdfUrl}
          onDeleteSuccess={handleDeleteSuccess}
        />
      ) : (
        <ResumeUploadForm onUploadSuccess={handleUploadSuccess} />
      )}
    </div>
  );
}
