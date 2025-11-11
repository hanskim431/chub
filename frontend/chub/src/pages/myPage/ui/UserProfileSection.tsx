import { useMe } from "@/features/auth/api/me";

export function UserProfileSection() {
  const { data: userData, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">내 프로필</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!userData?.data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">내 프로필</h2>
        <div className="text-gray-500">사용자 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  const user = userData.data;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">내 프로필</h2>
        <button
          type="button"
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          수정하기
        </button>
      </div>

      <div className="space-y-4">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
              {user.name || "이름 없음"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
              {user.email || "이메일 없음"}
            </div>
          </div>
        </div>

        {/* 자기소개 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            자기소개
          </label>
          <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[80px]">
            {user.bio || "자기소개가 없습니다."}
          </div>
        </div>
      </div>
    </div>
  );
}
