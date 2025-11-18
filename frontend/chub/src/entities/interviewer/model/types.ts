// Interviewer Profile Types

// 중첩 DTO
export interface ExperienceDto {
  company: string;
  startedYear: number;
  endedYear: string | null; // 숫자 또는 "재직중"
  role: string;
}

export interface EducationDto {
  school: string;
  startedYear: number | null;
  endedYear: number | null;
  role: string; // 학위: 학사, 석사, 박사 등
}

export interface CertificationDto {
  name: string;
  year: number;
}

// API Response
export interface InterviewerProfileResponse {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  field: string;
  company: string | null;
  position: string | null;
  bio: string | null;
  experiences: ExperienceDto[];
  specialties: string[];
  education: EducationDto[];
  certifications: CertificationDto[];
  languages: string[];
  interviewStyle: string | null;
  availableTimeSlots: string[];
  price: number;
  isActive?: boolean;
}

// API Request - 생성
export interface CreateInterviewerProfileRequest {
  name: string;
  email: string;
  avatar?: string | null;
  field: string;
  company?: string | null;
  position?: string | null;
  bio?: string | null;
  experiences?: ExperienceDto[];
  specialties?: string[];
  education?: EducationDto[];
  certifications?: CertificationDto[];
  languages?: string[];
  interviewStyle?: string | null;
  availableTimeSlots?: string[];
  price?: number;
}

// API Request - 수정 (모든 필드 선택적)
export interface UpdateInterviewerProfileRequest {
  isActive?: boolean; // 활성 상태 (중요!)
  name?: string;
  email?: string;
  avatar?: string | null;
  field?: string;
  company?: string | null;
  position?: string | null;
  bio?: string | null;
  experiences?: ExperienceDto[];
  specialties?: string[];
  education?: EducationDto[];
  certifications?: CertificationDto[];
  languages?: string[];
  interviewStyle?: string | null;
  availableTimeSlots?: string[];
  price?: number;
}

// 공통 API Response 타입 (Resume와 동일)
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
  errorData?: unknown;
  timestamp: string;
}
