import { useState, useEffect } from "react";
import { useMe } from "@/features/auth/api/me";
import { useQueryClient } from "@tanstack/react-query";
import {
  updateUserProfile,
  type UpdateUserProfileRequest,
} from "@/entities/user/api/requests";

export function UserProfileSection() {
  const { data: userData, isLoading } = useMe();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    if (userData?.data) {
      setFormData({
        name: userData.data.name || "",
        email: userData.data.email || "",
        bio: userData.data.bio || "",
      });
    }
  }, [userData]);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 수정 모드로 전환만 함 (실제 수정은 저장하기 버튼을 눌러야 함)
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (userData?.data) {
      setFormData({
        name: userData.data.name || "",
        email: userData.data.email || "",
        bio: userData.data.bio || "",
      });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 수정 모드가 아닐 때는 아무것도 하지 않음
    if (!isEditing) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: UpdateUserProfileRequest = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
      };
      await updateUserProfile(updateData);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setIsEditing(false);
      alert("프로필이 수정되었습니다.");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="submit"
                form="user-profile-form"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "저장 중..." : "저장하기"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                취소
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onMouseDown={(e) => e.preventDefault()}
            >
              수정하기
            </button>
          )}
        </div>
      </div>

      <form
        id="user-profile-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        onKeyDown={(e) => {
          // Enter 키로 form submit 방지
          if (e.key === "Enter" && !isEditing) {
            e.preventDefault();
          }
        }}
      >
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                onKeyDown={(e) => {
                  // Enter 키로 form submit 방지
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {user.name || "이름 없음"}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onKeyDown={(e) => {
                  // Enter 키로 form submit 방지
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {user.email || "이메일 없음"}
              </div>
            )}
          </div>
        </div>

        {/* 자기소개 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            자기소개
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              rows={4}
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[80px]">
              {user.bio || "자기소개가 없습니다."}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
