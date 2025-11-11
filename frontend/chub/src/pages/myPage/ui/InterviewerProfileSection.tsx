export function InterviewerProfileSection() {
  // 향후 면접관 프로필 API와 연동 예정
  const hasInterviewerProfile = false; // 임시

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">면접관 프로필</h2>

      {hasInterviewerProfile ? (
        <div className="space-y-4">
          {/* 면접관 프로필이 있을 때 표시할 내용 */}
          <p className="text-gray-700">면접관 프로필 정보</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            면접관으로 등록하면 다른 사용자들에게 면접 서비스를 제공할 수
            있습니다.
          </p>
          <button
            type="button"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            면접관으로 등록
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="mb-2">면접관 등록 시 입력할 정보:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>전문 분야 (예: 소프트웨어 엔지니어링)</li>
          <li>현재 회사 (예: 네이버)</li>
          <li>직급 (예: 시니어 개발자)</li>
          <li>경력 사항</li>
          <li>전문 기술 (예: Java, Spring Boot, Kubernetes)</li>
          <li>사용 가능 언어 (예: 한국어, 영어)</li>
          <li>면접 스타일</li>
          <li>가능한 시간대 (예: 평일 오후 7시-10시, 주말 오전 10시-오후 6시)</li>
          <li>면접 가격</li>
        </ul>
      </div>
    </div>
  );
}
