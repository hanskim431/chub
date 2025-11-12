import { useState, useEffect } from "react";
import { useMe } from "@/features/auth/api/me";
import {
  useMyInterviewerProfile,
  useCreateInterviewerProfile,
  useUpdateInterviewerProfile,
} from "@/entities/interviewer/api/query";
import {
  saveInterviewerProfileActiveStatus,
  getInterviewerProfileActiveStatus,
} from "../utils/localStorage";
import { TagInput } from "./TagInput";
import type { CreateInterviewerProfileRequest, UpdateInterviewerProfileRequest } from "@/entities/interviewer/model/types";

export function InterviewerProfileSection() {
  const { data: userData } = useMe();
  const { data: profileData, isLoading, refetch } = useMyInterviewerProfile();
  const { mutate: createProfile, isPending: isCreating } = useCreateInterviewerProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateInterviewerProfile();

  const hasProfile = profileData?.success && profileData?.data;
  const profile = hasProfile ? profileData.data : null;

  // 토글 상태 (localStorage에서 복원)
  const [isActive, setIsActive] = useState(true);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    field: "",
    company: "",
    position: "",
    bio: "",
    price: 0,
    specialties: [] as string[],
    languages: [] as string[],
    availableTimeSlots: [] as string[],
  });

  // 프로필 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        field: profile.field || "",
        company: profile.company || "",
        position: profile.position || "",
        bio: profile.bio || "",
        price: profile.price || 0,
        specialties: profile.specialties || [],
        languages: profile.languages || [],
        availableTimeSlots: profile.availableTimeSlots || [],
      });

      // localStorage에서 활성 상태 복원
      const savedIsActive = getInterviewerProfileActiveStatus(profile.id);
      setIsActive(savedIsActive);
    } else if (userData?.data) {
      // 프로필 없을 때 사용자 정보로 초기화
      setFormData((prev) => ({
        ...prev,
        name: userData.data.name || "",
        email: userData.data.email || "",
      }));
      setIsActive(false); // 프로필 없으면 비활성
    }
  }, [profile, userData]);

  const handleToggle = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    if (profile) {
      saveInterviewerProfileActiveStatus(newIsActive, profile.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasProfile && profile) {
      // 수정
      const updateData: UpdateInterviewerProfileRequest = {
        isActive,
        ...formData,
      };
      updateProfile(updateData, {
        onSuccess: () => {
          alert("면접관 프로필이 수정되었습니다.");
          refetch();
        },
        onError: () => {
          alert("면접관 프로필 수정에 실패했습니다.");
        },
      });
    } else {
      // 생성
      const createData: CreateInterviewerProfileRequest = formData;
      createProfile(createData, {
        onSuccess: () => {
          alert("면접관 프로필이 생성되었습니다.");
          setIsActive(true);
          refetch();
        },
        onError: () => {
          alert("면접관 프로필 생성에 실패했습니다.");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">면접관 프로필</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  const isDisabled = !isActive;
  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">면접관 프로필</h2>

        {/* 토글 스위치 */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isSubmitting}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive ? "bg-blue-600" : "bg-gray-300"
          } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {!hasProfile && !isActive && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          토글을 켜서 면접관 프로필을 작성해주세요.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isDisabled}
              required
              placeholder="예: 김민준"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isDisabled}
              required
              placeholder="예: minjun.kim@example.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전문 분야 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              disabled={isDisabled}
              required
              placeholder="예: 소프트웨어 엔지니어링"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회사명
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              disabled={isDisabled}
              placeholder="예: 네이버"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              직급
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              disabled={isDisabled}
              placeholder="예: 시니어 개발자"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              면접 가격 (원)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              disabled={isDisabled}
              min="0"
              placeholder="예: 80000"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50" : ""
              }`}
            />
          </div>
        </div>

        {/* 소개 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            소개
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={isDisabled}
            rows={4}
            placeholder="자신의 경력과 전문성을 소개해주세요"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50" : ""
            }`}
          />
        </div>

        {/* 전문 기술 */}
        <TagInput
          tags={formData.specialties}
          onChange={(tags) => setFormData({ ...formData, specialties: tags })}
          disabled={isDisabled}
          label="전문 기술"
          placeholder="예: Java, Spring Boot, Kubernetes"
        />

        {/* 사용 가능 언어 */}
        <TagInput
          tags={formData.languages}
          onChange={(tags) => setFormData({ ...formData, languages: tags })}
          disabled={isDisabled}
          label="사용 가능 언어"
          placeholder="예: 한국어, 영어"
        />

        {/* 가능한 시간대 */}
        <TagInput
          tags={formData.availableTimeSlots}
          onChange={(tags) => setFormData({ ...formData, availableTimeSlots: tags })}
          disabled={isDisabled}
          label="가능한 시간대"
          placeholder="예: 평일 오후 7시-10시, 주말 오전 10시-오후 6시"
        />

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="submit"
            disabled={!isActive || isSubmitting}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              !isActive || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "저장 중..." : hasProfile ? "수정하기" : "등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
