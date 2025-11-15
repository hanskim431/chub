import { useState } from "react";
import { useMe, useUpdateUser } from "@/features/auth/api/me";

export function UserProfileSection() {
    const { data: userData, isLoading, refetch } = useMe();
    const { mutate: updateUser, isPending } = useUpdateUser();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
    });

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
                <div className="text-gray-500">
                    사용자 정보를 불러올 수 없습니다.
                </div>
            </div>
        );
    }

    const user = userData.data;

    const handleEditClick = () => {
        setFormData({
            name: user.name || "",
            email: user.email || "",
            bio: user.bio || "",
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user.name || "",
            email: user.email || "",
            bio: user.bio || "",
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(formData, {
            onSuccess: () => {
                alert("프로필이 수정되었습니다.");
                setIsEditing(false);
                refetch();
            },
            onError: () => {
                alert("프로필 수정에 실패했습니다.");
            },
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">내 프로필</h2>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={handleEditClick}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        수정하기
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
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
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-point"
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
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-point"
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
                                    setFormData({
                                        ...formData,
                                        bio: e.target.value,
                                    })
                                }
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-point"
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 min-h-[80px]">
                                {user.bio || "자기소개가 없습니다."}
                            </div>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isPending}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 text-sm bg-point text-white rounded-md hover:bg-point-500 transition-colors disabled:opacity-50"
                        >
                            {isPending ? "저장 중..." : "저장하기"}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
