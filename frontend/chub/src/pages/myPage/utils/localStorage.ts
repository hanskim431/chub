// 면접관 프로필 활성 상태 관리를 위한 localStorage 유틸리티

const INTERVIEWER_PROFILE_ACTIVE_KEY = "interviewer_profile_active";

/**
 * 면접관 프로필 활성 상태 저장
 * @param profileId 프로필 ID (선택적, 없으면 기본 키 사용)
 * @param isActive 활성 상태
 */
export function saveInterviewerProfileActiveStatus(
  isActive: boolean,
  profileId?: number
): void {
  const key = profileId
    ? `${INTERVIEWER_PROFILE_ACTIVE_KEY}_${profileId}`
    : INTERVIEWER_PROFILE_ACTIVE_KEY;

  localStorage.setItem(key, JSON.stringify(isActive));
}

/**
 * 면접관 프로필 활성 상태 읽기
 * @param profileId 프로필 ID (선택적, 없으면 기본 키 사용)
 * @returns 활성 상태 (없으면 true 반환)
 */
export function getInterviewerProfileActiveStatus(profileId?: number): boolean {
  const key = profileId
    ? `${INTERVIEWER_PROFILE_ACTIVE_KEY}_${profileId}`
    : INTERVIEWER_PROFILE_ACTIVE_KEY;

  const stored = localStorage.getItem(key);

  if (stored === null) {
    return true; // 기본값: 활성
  }

  try {
    return JSON.parse(stored);
  } catch {
    return true; // 파싱 실패 시 기본값
  }
}

/**
 * 면접관 프로필 활성 상태 삭제
 * @param profileId 프로필 ID (선택적, 없으면 기본 키 사용)
 */
export function clearInterviewerProfileActiveStatus(profileId?: number): void {
  const key = profileId
    ? `${INTERVIEWER_PROFILE_ACTIVE_KEY}_${profileId}`
    : INTERVIEWER_PROFILE_ACTIVE_KEY;

  localStorage.removeItem(key);
}
