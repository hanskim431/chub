-- ============================================
-- CHUB Interview Platform - PostgreSQL Schema
-- ============================================
-- 데이터베이스: chub
-- PostgreSQL 버전: 16
-- 작성일: 2024
-- ============================================

-- 기존 테이블 삭제 (초기화 시에만 사용)
-- DROP TABLE IF EXISTS questions CASCADE;
-- DROP TABLE IF EXISTS interviews CASCADE;
-- DROP TABLE IF EXISTS interview_requests CASCADE;
-- DROP TABLE IF EXISTS resumes CASCADE;
-- DROP TABLE IF EXISTS refresh_tokens CASCADE;
-- DROP TABLE IF EXISTS interviewer_profiles CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. users (사용자)
-- ============================================
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    sub VARCHAR(255) UNIQUE NOT NULL,                    -- Kakao OAuth sub (고유 식별자)
    username VARCHAR(255),                               -- 사용자 이름
    avatar_url TEXT,                                     -- 프로필 이미지 URL
    bio TEXT,                                            -- 자기소개
    email VARCHAR(255),                                  -- 이메일
    is_deleted BOOLEAN DEFAULT false,                    -- 소프트 삭제 플래그
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP       -- 생성 시간
);

-- 인덱스 생성
CREATE INDEX idx_users_sub ON users(sub);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);

-- 코멘트 추가
COMMENT ON TABLE users IS '사용자 테이블 (Kakao OAuth 기반)';
COMMENT ON COLUMN users.sub IS 'Kakao OAuth Subject (고유 식별자)';
COMMENT ON COLUMN users.is_deleted IS '소프트 삭제 플래그 (true: 삭제됨)';

-- ============================================
-- 2. interviewer_profiles (면접관 프로필)
-- ============================================
CREATE TABLE interviewer_profiles (
    interviewer_profile_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company VARCHAR(255),                                -- 회사명
    position VARCHAR(255),                               -- 직책
    department VARCHAR(255),                             -- 부서
    career_level VARCHAR(100),                           -- 경력 레벨 (Junior, Mid, Senior 등)
    introduction TEXT,                                   -- 소개
    total_years_of_experience INTEGER,                   -- 총 경력 연수
    languages JSONB,                                     -- 언어 능력 (JSON 배열)
    specialties JSONB,                                   -- 전문 분야 (JSON 배열)
    educations JSONB,                                    -- 학력 (JSON 배열)
    experiences JSONB,                                   -- 경력 (JSON 배열)
    certifications JSONB,                                -- 자격증 (JSON 배열)
    available_time_slots JSONB,                          -- 가능 시간대 (JSON 배열)
    email VARCHAR(255),                                  -- 이메일
    field VARCHAR(255),                                  -- 분야 (Backend, Frontend 등)
    price INTEGER,                                       -- 면접 가격 (원)
    interview_style TEXT,                                -- 면접 스타일
    is_active BOOLEAN DEFAULT true,                      -- 활성화 상태
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interviewer_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_interviewer_user_id ON interviewer_profiles(user_id);
CREATE INDEX idx_interviewer_field ON interviewer_profiles(field);
CREATE INDEX idx_interviewer_is_active ON interviewer_profiles(is_active);
CREATE INDEX idx_interviewer_price ON interviewer_profiles(price);

-- 코멘트 추가
COMMENT ON TABLE interviewer_profiles IS '면접관 프로필 테이블';
COMMENT ON COLUMN interviewer_profiles.languages IS 'JSON 배열: [{language: string, proficiency: string}]';
COMMENT ON COLUMN interviewer_profiles.specialties IS 'JSON 배열: [{specialty: string, description: string}]';
COMMENT ON COLUMN interviewer_profiles.educations IS 'JSON 배열: [{institution: string, degree: string, major: string, startDate: date, endDate: date}]';
COMMENT ON COLUMN interviewer_profiles.experiences IS 'JSON 배열: [{company: string, position: string, startDate: date, endDate: date, description: string}]';
COMMENT ON COLUMN interviewer_profiles.certifications IS 'JSON 배열: [{name: string, issuer: string, issueDate: date, expiryDate: date}]';
COMMENT ON COLUMN interviewer_profiles.available_time_slots IS 'JSON 배열: [{dayOfWeek: string, startTime: string, endTime: string}]';

-- ============================================
-- 3. resumes (이력서)
-- ============================================
CREATE TABLE resumes (
    resume_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pdf_url TEXT NOT NULL,                               -- PDF 파일 URL (로컬 저장소 경로)
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- 업로드 시간
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_resume_user_id ON resumes(user_id);
CREATE INDEX idx_resume_uploaded_at ON resumes(uploaded_at);

-- 코멘트 추가
COMMENT ON TABLE resumes IS '이력서 테이블 (PDF 파일)';
COMMENT ON COLUMN resumes.pdf_url IS 'PDF 파일 URL (예: https://chub.ai.kr/files/resumes/1234567890_resume.pdf)';

-- ============================================
-- 4. interview_requests (면접 요청)
-- ============================================
CREATE TABLE interview_requests (
    interview_request_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,                             -- 면접 요청자 (피면접자)
    interviewer_profile_id BIGINT NOT NULL,
    request_message TEXT,                                -- 요청 메시지
    status VARCHAR(50) DEFAULT 'PENDING',                -- 상태: PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED
    scheduled_at TIMESTAMP,                              -- 예정 시간
    duration INTEGER,                                    -- 면접 시간 (분)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_request_interviewer FOREIGN KEY (interviewer_profile_id) REFERENCES interviewer_profiles(interviewer_profile_id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'))
);

-- 인덱스 생성
CREATE INDEX idx_interview_request_user_id ON interview_requests(user_id);
CREATE INDEX idx_interview_request_interviewer ON interview_requests(interviewer_profile_id);
CREATE INDEX idx_interview_request_status ON interview_requests(status);
CREATE INDEX idx_interview_request_scheduled_at ON interview_requests(scheduled_at);

-- 코멘트 추가
COMMENT ON TABLE interview_requests IS '면접 요청 테이블';
COMMENT ON COLUMN interview_requests.status IS '상태: PENDING(대기), APPROVED(승인), REJECTED(거절), CANCELLED(취소), COMPLETED(완료)';

-- ============================================
-- 5. interviews (면접)
-- ============================================
CREATE TABLE interviews (
    interview_id BIGSERIAL PRIMARY KEY,
    interviewer_profile_id BIGINT NOT NULL,
    resume_id BIGINT,
    title VARCHAR(255),                                  -- 면접 제목
    status VARCHAR(50) DEFAULT 'PENDING',                -- 상태: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    started_at TIMESTAMP,                                -- 시작 시간
    ended_at TIMESTAMP,                                  -- 종료 시간
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_interviewer FOREIGN KEY (interviewer_profile_id) REFERENCES interviewer_profiles(interviewer_profile_id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE SET NULL,
    CONSTRAINT chk_interview_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

-- 인덱스 생성
CREATE INDEX idx_interview_interviewer ON interviews(interviewer_profile_id);
CREATE INDEX idx_interview_resume ON interviews(resume_id);
CREATE INDEX idx_interview_status ON interviews(status);
CREATE INDEX idx_interview_started_at ON interviews(started_at);

-- 코멘트 추가
COMMENT ON TABLE interviews IS '면접 테이블';
COMMENT ON COLUMN interviews.status IS '상태: PENDING(대기), IN_PROGRESS(진행 중), COMPLETED(완료), CANCELLED(취소)';

-- ============================================
-- 6. questions (면접 질문 및 답변)
-- ============================================
CREATE TABLE questions (
    question_id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    content TEXT NOT NULL,                               -- 질문 내용
    answer TEXT,                                         -- 답변 내용 (STT로 변환된 텍스트)
    order_number INTEGER,                                -- 질문 순서
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_interview FOREIGN KEY (interview_id) REFERENCES interviews(interview_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_question_interview ON questions(interview_id);
CREATE INDEX idx_question_order ON questions(interview_id, order_number);

-- 코멘트 추가
COMMENT ON TABLE questions IS '면접 질문 및 답변 테이블';
COMMENT ON COLUMN questions.content IS '질문 내용';
COMMENT ON COLUMN questions.answer IS '답변 내용 (STT로 변환된 텍스트)';
COMMENT ON COLUMN questions.order_number IS '질문 순서 (1부터 시작)';

-- ============================================
-- 7. refresh_tokens (리프레시 토큰)
-- ============================================
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,                 -- JWT Refresh Token
    expiration_date TIMESTAMP NOT NULL,                  -- 만료 시간
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_token ON refresh_tokens(refresh_token);
CREATE INDEX idx_refresh_token_expiration ON refresh_tokens(expiration_date);

-- 코멘트 추가
COMMENT ON TABLE refresh_tokens IS 'JWT Refresh Token 테이블';
COMMENT ON COLUMN refresh_tokens.refresh_token IS 'JWT Refresh Token (512자)';
COMMENT ON COLUMN refresh_tokens.expiration_date IS 'Refresh Token 만료 시간';

-- ============================================
-- 만료된 Refresh Token 자동 삭제 함수 (선택사항)
-- ============================================
CREATE OR REPLACE FUNCTION delete_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens WHERE expiration_date < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 샘플 데이터 삽입 (개발/테스트용)
-- ============================================

-- 샘플 사용자 1 (일반 사용자)
INSERT INTO users (sub, username, avatar_url, bio, email, is_deleted)
VALUES
    ('kakao_1234567890', '김철수', 'https://via.placeholder.com/150', '백엔드 개발자를 희망합니다.', 'chulsoo@example.com', false);

-- 샘플 사용자 2 (면접관)
INSERT INTO users (sub, username, avatar_url, bio, email, is_deleted)
VALUES
    ('kakao_9876543210', '이영희', 'https://via.placeholder.com/150', '10년차 시니어 개발자입니다.', 'younghee@example.com', false);

-- 샘플 면접관 프로필
INSERT INTO interviewer_profiles (
    user_id, company, position, department, career_level, introduction,
    total_years_of_experience, languages, specialties, educations, experiences,
    certifications, available_time_slots, email, field, price, interview_style, is_active
)
VALUES (
    2, -- user_id (이영희)
    'Samsung Electronics',
    'Senior Software Engineer',
    'Platform Development',
    'SENIOR',
    '10년간 백엔드 개발 경험이 있으며, Spring Boot와 MSA 전문가입니다.',
    10,
    '[{"language": "Korean", "proficiency": "NATIVE"}, {"language": "English", "proficiency": "FLUENT"}]'::jsonb,
    '[{"specialty": "Backend Development", "description": "Spring Boot, JPA, Microservices"}, {"specialty": "Database Design", "description": "PostgreSQL, MongoDB, Redis"}]'::jsonb,
    '[{"institution": "Seoul National University", "degree": "Bachelor", "major": "Computer Science", "startDate": "2010-03-01", "endDate": "2014-02-28"}]'::jsonb,
    '[{"company": "Samsung Electronics", "position": "Senior Software Engineer", "startDate": "2014-03-01", "endDate": null, "description": "Platform backend development"}]'::jsonb,
    '[{"name": "AWS Certified Solutions Architect", "issuer": "Amazon Web Services", "issueDate": "2020-06-15", "expiryDate": "2023-06-15"}]'::jsonb,
    '[{"dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "12:00"}, {"dayOfWeek": "WEDNESDAY", "startTime": "14:00", "endTime": "18:00"}]'::jsonb,
    'younghee@example.com',
    'Backend',
    50000,
    '실무 중심의 기술 면접을 진행합니다. 코딩 테스트와 시스템 디자인을 중점적으로 다룹니다.',
    true
);

-- 샘플 이력서
INSERT INTO resumes (user_id, pdf_url)
VALUES
    (1, 'https://chub.ai.kr/files/resumes/1234567890_resume.pdf');

-- 샘플 면접 요청
INSERT INTO interview_requests (user_id, interviewer_profile_id, request_message, status, scheduled_at, duration)
VALUES
    (1, 1, '백엔드 개발자 포지션 모의 면접을 요청드립니다.', 'APPROVED', '2024-02-01 14:00:00', 60);

-- 샘플 면접
INSERT INTO interviews (interviewer_profile_id, resume_id, title, status, started_at, ended_at)
VALUES
    (1, 1, 'Backend Developer Mock Interview', 'COMPLETED', '2024-02-01 14:00:00', '2024-02-01 15:00:00');

-- 샘플 질문 및 답변
INSERT INTO questions (interview_id, content, answer, order_number)
VALUES
    (1, 'Spring Boot의 장점을 설명해주세요.', 'Spring Boot는 설정이 간편하고 내장 서버를 제공하여 빠르게 애플리케이션을 개발할 수 있습니다.', 1),
    (1, 'JPA와 MyBatis의 차이점은 무엇인가요?', 'JPA는 ORM 기반으로 객체 지향적이며, MyBatis는 SQL 매퍼로 SQL을 직접 작성합니다.', 2);

-- ============================================
-- 데이터베이스 정보 확인
-- ============================================

-- 테이블 목록 확인
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 인덱스 확인
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- 테이블 크기 확인
-- SELECT
--     table_name,
--     pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- ============================================
-- MongoDB 인덱스 생성 스크립트 (참고용)
-- ============================================

/*
MongoDB Shell에서 실행:

use chub;

// chatrooms 컬렉션 인덱스
db.chatrooms.createIndex({ "room_id": 1 }, { unique: true, name: "idx_room_id" });
db.chatrooms.createIndex({ "participantIds": 1, "updatedAt": -1 }, { name: "idx_participants_updated" });
db.chatrooms.createIndex({ "room_id": 1, "updatedAt": -1 }, { name: "idx_room_updated" });

// messages 컬렉션 인덱스
db.messages.createIndex({ "room_id": 1, "created_at": -1 }, { name: "idx_room_created" });
db.messages.createIndex({ "message_from": 1, "created_at": -1 }, { name: "idx_from_created" });

// 인덱스 확인
db.chatrooms.getIndexes();
db.messages.getIndexes();
*/

-- ============================================
-- 백업 및 복원 명령어 (참고용)
-- ============================================

/*
PostgreSQL 백업:
pg_dump -U chub_user -d chub -h localhost -F c -f chub_backup.dump

PostgreSQL 복원:
pg_restore -U chub_user -d chub -h localhost -v chub_backup.dump

또는 SQL 파일로:
pg_dump -U chub_user -d chub -h localhost -f chub_backup.sql
psql -U chub_user -d chub -h localhost -f chub_backup.sql
*/
