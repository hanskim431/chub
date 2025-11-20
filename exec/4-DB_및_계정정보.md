# 4. DB 접속 정보 및 계정 정보

## 4.1 PostgreSQL 데이터베이스

### 4.1.1 접속 정보

**개발 환경:**
```yaml
호스트: localhost
포트: 5432
데이터베이스: chub
사용자명: postgres
비밀번호: 3709
JDBC URL: jdbc:postgresql://localhost:5432/chub
```

**프로덕션 환경 (Docker):**
```yaml
호스트: postgres (Docker 서비스명)
포트: 5432
데이터베이스: chub
사용자명: ${DB_USERNAME}  # 환경변수로 설정
비밀번호: ${DB_PASSWORD}  # 환경변수로 설정
JDBC URL: jdbc:postgresql://postgres:5432/chub
```

### 4.1.2 데이터베이스 스키마

#### 1. users (사용자)

```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    sub VARCHAR(255) UNIQUE NOT NULL,           -- Kakao OAuth sub
    username VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    email VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_sub ON users(sub);
CREATE INDEX idx_users_email ON users(email);
```

**주요 컬럼:**
- `user_id`: 내부 사용자 ID (자동 증가)
- `sub`: Kakao OAuth Subject (고유 식별자)
- `is_deleted`: 소프트 삭제 플래그

#### 2. interviewer_profiles (면접관 프로필)

```sql
CREATE TABLE interviewer_profiles (
    interviewer_profile_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company VARCHAR(255),
    position VARCHAR(255),
    department VARCHAR(255),
    career_level VARCHAR(100),
    introduction TEXT,
    total_years_of_experience INTEGER,
    languages JSONB,                            -- JSON 배열
    specialties JSONB,                          -- JSON 배열
    educations JSONB,                           -- JSON 배열
    experiences JSONB,                          -- JSON 배열
    certifications JSONB,                       -- JSON 배열
    available_time_slots JSONB,                 -- JSON 배열
    email VARCHAR(255),
    field VARCHAR(255),
    price INTEGER,
    interview_style TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interviewer_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_interviewer_user_id ON interviewer_profiles(user_id);
CREATE INDEX idx_interviewer_field ON interviewer_profiles(field);
CREATE INDEX idx_interviewer_is_active ON interviewer_profiles(is_active);
```

**JSONB 컬럼 예시:**

**languages:**
```json
[
  {
    "language": "Korean",
    "proficiency": "NATIVE"
  },
  {
    "language": "English",
    "proficiency": "FLUENT"
  }
]
```

**specialties:**
```json
[
  {
    "specialty": "Backend Development",
    "description": "Spring Boot, JPA"
  },
  {
    "specialty": "Database Design",
    "description": "PostgreSQL, MongoDB"
  }
]
```

**educations:**
```json
[
  {
    "institution": "Seoul National University",
    "degree": "Bachelor",
    "major": "Computer Science",
    "startDate": "2015-03-01",
    "endDate": "2019-02-28"
  }
]
```

**experiences:**
```json
[
  {
    "company": "Samsung Electronics",
    "position": "Senior Software Engineer",
    "startDate": "2019-03-01",
    "endDate": null,
    "description": "Backend development"
  }
]
```

**certifications:**
```json
[
  {
    "name": "AWS Certified Solutions Architect",
    "issuer": "Amazon Web Services",
    "issueDate": "2022-06-15",
    "expiryDate": "2025-06-15"
  }
]
```

**available_time_slots:**
```json
[
  {
    "dayOfWeek": "MONDAY",
    "startTime": "09:00",
    "endTime": "12:00"
  },
  {
    "dayOfWeek": "WEDNESDAY",
    "startTime": "14:00",
    "endTime": "18:00"
  }
]
```

#### 3. resumes (이력서)

```sql
CREATE TABLE resumes (
    resume_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pdf_url TEXT NOT NULL,                      -- 파일 저장 경로
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_resume_user_id ON resumes(user_id);
```

**pdf_url 형식:**
```
https://chub.ai.kr/files/resumes/1234567890_resume.pdf
```

#### 4. interview_requests (면접 요청)

```sql
CREATE TABLE interview_requests (
    interview_request_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,                    -- 면접 요청자 (피면접자)
    interviewer_profile_id BIGINT NOT NULL,
    request_message TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',       -- PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED
    scheduled_at TIMESTAMP,
    duration INTEGER,                           -- 면접 시간 (분)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_request_interviewer FOREIGN KEY (interviewer_profile_id) REFERENCES interviewer_profiles(interviewer_profile_id)
);

CREATE INDEX idx_interview_request_user_id ON interview_requests(user_id);
CREATE INDEX idx_interview_request_interviewer ON interview_requests(interviewer_profile_id);
CREATE INDEX idx_interview_request_status ON interview_requests(status);
```

**status 값:**
- `PENDING`: 승인 대기
- `APPROVED`: 승인됨
- `REJECTED`: 거절됨
- `CANCELLED`: 취소됨
- `COMPLETED`: 완료됨

#### 5. interviews (면접)

```sql
CREATE TABLE interviews (
    interview_id BIGSERIAL PRIMARY KEY,
    interviewer_profile_id BIGINT NOT NULL,
    resume_id BIGINT,
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING',       -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_interviewer FOREIGN KEY (interviewer_profile_id) REFERENCES interviewer_profiles(interviewer_profile_id),
    CONSTRAINT fk_interview_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id)
);

CREATE INDEX idx_interview_interviewer ON interviews(interviewer_profile_id);
CREATE INDEX idx_interview_resume ON interviews(resume_id);
CREATE INDEX idx_interview_status ON interviews(status);
```

#### 6. questions (면접 질문 및 답변)

```sql
CREATE TABLE questions (
    question_id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    content TEXT NOT NULL,                      -- 질문 내용
    answer TEXT,                                -- 답변 내용 (STT로 변환된 텍스트)
    order_number INTEGER,                       -- 질문 순서
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_interview FOREIGN KEY (interview_id) REFERENCES interviews(interview_id)
);

CREATE INDEX idx_question_interview ON questions(interview_id);
CREATE INDEX idx_question_order ON questions(interview_id, order_number);
```

#### 7. refresh_tokens (리프레시 토큰)

```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_token ON refresh_tokens(refresh_token);
CREATE INDEX idx_refresh_token_expiration ON refresh_tokens(expiration_date);
```

### 4.1.3 ERD 관계

```
users (1) ──────< (N) interviewer_profiles
  │
  ├──────< (N) resumes
  │
  ├──────< (N) interview_requests
  │
  └──────< (N) refresh_tokens

interviewer_profiles (1) ──────< (N) interview_requests
  │
  └──────< (N) interviews

resumes (1) ──────< (N) interviews

interviews (1) ──────< (N) questions
```

---

## 4.2 MongoDB 데이터베이스

### 4.2.1 접속 정보

**MongoDB Atlas (Cloud):**
```yaml
연결 방식: MongoDB Atlas
URI: mongodb+srv://<username>:<password>@<cluster-url>/<database>
데이터베이스: chub
컬렉션: chatrooms, messages
```

**환경변수:**
```bash
MONGODB_URI=mongodb+srv://chub_user:yourpassword@cluster0.xxxxx.mongodb.net/chub?retryWrites=true&w=majority
```

### 4.2.2 컬렉션 스키마

#### 1. chatrooms (채팅방)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  room_id: "user123_user456",                  // 고유 채팅방 ID
  participantIds: [123, 456],                  // Long 타입 사용자 ID 배열
  participants: {
    "123": {
      unreadCount: 5,                          // 읽지 않은 메시지 수
      lastReadAt: ISODate("2024-01-15T10:30:00Z"),
      countedAt: ISODate("2024-01-15T10:00:00Z")
    },
    "456": {
      unreadCount: 0,
      lastReadAt: ISODate("2024-01-15T10:35:00Z"),
      countedAt: ISODate("2024-01-15T10:35:00Z")
    }
  },
  lastMessage: "안녕하세요, 면접 일정 조율 가능할까요?",
  updatedAt: ISODate("2024-01-15T10:35:00Z")
}
```

**인덱스:**
```javascript
db.chatrooms.createIndex({ "room_id": 1 }, { unique: true });
db.chatrooms.createIndex({ "participantIds": 1, "updatedAt": -1 });
db.chatrooms.createIndex({ "room_id": 1, "updatedAt": -1 });
```

#### 2. messages (메시지)

```javascript
{
  _id: ObjectId("507f191e810c19729de860ea"),
  room_id: "user123_user456",                  // 채팅방 ID
  message_from: 123,                           // Long 타입 발신자 ID
  content: "면접 일정은 다음 주 화요일 오후 2시 어떠신가요?",
  created_at: ISODate("2024-01-15T10:35:00Z")
}
```

**인덱스:**
```javascript
db.messages.createIndex({ "room_id": 1, "created_at": -1 });
db.messages.createIndex({ "message_from": 1, "created_at": -1 });
```

### 4.2.3 MongoDB 인덱스 생성 스크립트

```javascript
// chatrooms 컬렉션 인덱스
use chub;

db.chatrooms.createIndex(
  { "room_id": 1 },
  { unique: true, name: "idx_room_id" }
);

db.chatrooms.createIndex(
  { "participantIds": 1, "updatedAt": -1 },
  { name: "idx_participants_updated" }
);

db.chatrooms.createIndex(
  { "room_id": 1, "updatedAt": -1 },
  { name: "idx_room_updated" }
);

// messages 컬렉션 인덱스
db.messages.createIndex(
  { "room_id": 1, "created_at": -1 },
  { name: "idx_room_created" }
);

db.messages.createIndex(
  { "message_from": 1, "created_at": -1 },
  { name: "idx_from_created" }
);

// 인덱스 확인
db.chatrooms.getIndexes();
db.messages.getIndexes();
```

---

## 4.3 설정 파일 위치

### 4.3.1 Backend 설정 파일

**Spring Boot 설정:**
```
backend/chub/src/main/resources/
├── application.yml              # 개발 환경 설정
├── application-prod.yml         # 프로덕션 환경 설정
└── application-secret.yml       # 시크릿 정보 (Git 미포함)
```

**application.yml 주요 내용:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/chub
    username: postgres
    password: 3709

  data:
    mongodb:
      uri: ${MONGODB_URI}

  jpa:
    hibernate:
      ddl-auto: create
    properties:
      hibernate:
        show_sql: true
        format_sql: true
```

**application-prod.yml 주요 내용:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:postgres}:${DB_PORT:5432}/${DB_NAME:chub}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2

  jpa:
    hibernate:
      ddl-auto: ${DDL_AUTO:create}
    properties:
      hibernate:
        show_sql: false
        format_sql: false
    open-in-view: false
```

**application-secret.yml 예시:**
```yaml
jwt:
  secret-key: ${JWT_SECRET_KEY:your-dev-secret-key-base64-encoded}
  access-token-minute-time: ${JWT_ACCESS_TOKEN_MINUTE_TIME:60}
  refresh-token-minute-time: ${JWT_REFRESH_TOKEN_MINUTE_TIME:10080}

kakao:
  oauth2:
    client-id: ${KAKAO_CLIENT_ID}
    client-secret: ${KAKAO_CLIENT_SECRET}
    redirect-url: ${KAKAO_REDIRECT_URL:http://localhost:3000/auth/kakao/callback}
    token-url: ${KAKAO_TOKEN_URL:https://kauth.kakao.com/oauth/token}

gms:
  api-key: ${GMS_API_KEY}
  whisper-url: ${GMS_WHISPER_URL}
  gpt-url: ${GMS_GPT_URL}

file:
  upload-dir: ${FILE_UPLOAD_DIR:/app/uploads/resumes}
  base-url: ${FILE_BASE_URL:http://localhost:8080/files/resumes}

cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}

frontend:
  url: ${FRONTEND_URL:http://localhost:3000}
```

### 4.3.2 Frontend 설정 파일

**환경변수 파일:**
```
frontend/chub/.env
```

**내용:**
```bash
VITE_API_URL=http://localhost:8080
VITE_API_MOCK=true
VITE_STUN_SERVER=stun:chub.ai.kr:3478
VITE_TURN_SERVER=turn:chub.ai.kr:3478
VITE_TURN_USERNAME=chubuser
VITE_TURN_PASSWORD=chubpassword123
```

### 4.3.3 Docker Compose 설정

**파일 위치:**
```
backend/docker-compose.yml
backend/.env
```

---

## 4.4 계정 및 인증 정보 요약

### 4.4.1 데이터베이스 계정

| 서비스 | 사용자명 | 비밀번호 | 용도 |
|--------|---------|---------|------|
| PostgreSQL (dev) | `postgres` | `3709` | 개발 환경 |
| PostgreSQL (prod) | `${DB_USERNAME}` | `${DB_PASSWORD}` | 프로덕션 환경 |
| MongoDB Atlas | `${MONGODB_USERNAME}` | `${MONGODB_PASSWORD}` | 채팅 DB |

### 4.4.2 외부 서비스 인증

| 서비스 | 인증 방식 | 환경변수 |
|--------|----------|---------|
| Kakao OAuth | REST API Key + Client Secret | `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET` |
| GMS API | API Key | `GMS_API_KEY` |
| JWT | Secret Key | `JWT_SECRET_KEY` |

### 4.4.3 WebRTC 인증 (Coturn)

| 항목 | 값 | 파일 위치 |
|-----|-----|----------|
| STUN Server | `stun:chub.ai.kr:3478` | `frontend/chub/.env` |
| TURN Server | `turn:chub.ai.kr:3478` | `frontend/chub/.env` |
| 사용자명 | `chubuser` | `backend/coturn/turnserver.conf` |
| 비밀번호 | `chubpassword123` | `backend/coturn/turnserver.conf` |

---

## 4.5 데이터베이스 백업 및 복원

### 4.5.1 PostgreSQL 백업

```bash
# 전체 데이터베이스 덤프
docker exec chub-postgres pg_dump -U chub_user chub > chub_backup_$(date +%Y%m%d).sql

# 스키마만 백업
docker exec chub-postgres pg_dump -U chub_user -s chub > chub_schema.sql

# 특정 테이블만 백업
docker exec chub-postgres pg_dump -U chub_user -t users -t interviewer_profiles chub > chub_users_backup.sql
```

### 4.5.2 PostgreSQL 복원

```bash
# 데이터베이스 복원
docker exec -i chub-postgres psql -U chub_user -d chub < chub_backup.sql

# 또는 docker-compose 사용
cat chub_backup.sql | docker-compose exec -T postgres psql -U chub_user -d chub
```

### 4.5.3 MongoDB 백업

```bash
# 전체 데이터베이스 덤프
mongodump --uri="mongodb+srv://chub_user:password@cluster.mongodb.net/chub" --out=dump/

# 특정 컬렉션만 백업
mongodump --uri="mongodb+srv://..." --collection=chatrooms --out=dump/
mongodump --uri="mongodb+srv://..." --collection=messages --out=dump/
```

### 4.5.4 MongoDB 복원

```bash
# 전체 복원
mongorestore --uri="mongodb+srv://chub_user:password@cluster.mongodb.net/chub" --drop dump/chub/

# 특정 컬렉션 복원
mongorestore --uri="mongodb+srv://..." --collection=chatrooms dump/chub/chatrooms.bson
```

---

## 4.6 데이터베이스 모니터링

### 4.6.1 PostgreSQL 쿼리 로그

**활성 쿼리 확인:**
```sql
SELECT pid, usename, application_name, state, query, query_start
FROM pg_stat_activity
WHERE state = 'active';
```

**느린 쿼리 확인:**
```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 4.6.2 MongoDB 쿼리 프로파일링

```javascript
// 프로파일링 활성화
db.setProfilingLevel(2);

// 느린 쿼리 확인
db.system.profile.find().sort({ ts: -1 }).limit(10);

// 인덱스 사용률 확인
db.chatrooms.explain("executionStats").find({ participantIds: 123 });
```
