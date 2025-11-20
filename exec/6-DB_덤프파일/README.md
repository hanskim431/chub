# DB 덤프 파일

이 폴더에는 CHUB Interview Platform의 데이터베이스 스키마와 인덱스 생성 스크립트가 포함되어 있습니다.

## 파일 목록

### 1. chub_schema.sql
- **용도**: PostgreSQL 데이터베이스 스키마 생성
- **내용**:
  - 7개 테이블 DDL (users, interviewer_profiles, resumes, interview_requests, interviews, questions, refresh_tokens)
  - 인덱스 생성 스크립트
  - 샘플 데이터 (개발/테스트용)
  - 코멘트 및 제약조건

### 2. mongodb_indexes.js
- **용도**: MongoDB 인덱스 생성 및 샘플 데이터 삽입
- **내용**:
  - chatrooms 컬렉션 인덱스 (3개)
  - messages 컬렉션 인덱스 (2개)
  - 샘플 채팅방 및 메시지
  - 인덱스 사용 통계 확인

---

## 사용 방법

### PostgreSQL 스키마 생성

#### 방법 1: Docker를 통한 실행
```bash
# 파일을 컨테이너로 복사
docker cp exec/6-DB_덤프파일/chub_schema.sql chub-postgres:/tmp/

# 컨테이너 내부에서 실행
docker exec -it chub-postgres psql -U chub_user -d chub -f /tmp/chub_schema.sql
```

#### 방법 2: 로컬 PostgreSQL에서 실행
```bash
# psql 명령어 사용
psql -U postgres -d chub -f exec/6-DB_덤프파일/chub_schema.sql

# 또는 리다이렉션 사용
psql -U postgres -d chub < exec/6-DB_덤프파일/chub_schema.sql
```

#### 방법 3: pgAdmin 사용
1. pgAdmin 실행
2. chub 데이터베이스 우클릭
3. "Query Tool" 선택
4. `chub_schema.sql` 파일 열기
5. 실행 (F5)

### MongoDB 인덱스 생성

#### 방법 1: MongoDB Shell 사용
```bash
# MongoDB Shell 접속 (Atlas)
mongosh "mongodb+srv://cluster.mongodb.net/chub" --username chub_user

# 스크립트 실행
load("exec/6-DB_덤프파일/mongodb_indexes.js")
```

#### 방법 2: mongosh 명령어로 직접 실행
```bash
mongosh "mongodb+srv://cluster.mongodb.net/chub" --username chub_user --file exec/6-DB_덤프파일/mongodb_indexes.js
```

#### 방법 3: MongoDB Compass 사용
1. MongoDB Compass 실행 및 연결
2. chub 데이터베이스 선택
3. "Collections" 탭에서 chatrooms 선택
4. "Indexes" 탭 클릭
5. "Create Index" 버튼으로 수동 생성

---

## 주의사항

### PostgreSQL

1. **DDL Auto 설정**
   - 스키마 파일을 실행하기 전에 `application.yml`의 `ddl-auto` 설정을 `none`으로 변경하세요.
   - Spring Boot가 자동으로 테이블을 생성하지 않도록 방지합니다.

2. **기존 데이터 삭제**
   - 스크립트 실행 시 기존 테이블이 있으면 충돌이 발생할 수 있습니다.
   - 필요 시 스크립트 상단의 `DROP TABLE` 주석을 해제하세요.

3. **샘플 데이터**
   - 스크립트에 포함된 샘플 데이터는 개발/테스트용입니다.
   - 프로덕션 환경에서는 삭제하세요.

### MongoDB

1. **인덱스 생성 시간**
   - 대량의 데이터가 있는 경우 인덱스 생성에 시간이 걸릴 수 있습니다.
   - `background: true` 옵션으로 백그라운드에서 생성됩니다.

2. **고유 인덱스**
   - `room_id`는 고유 인덱스로 설정됩니다.
   - 중복 데이터가 있으면 인덱스 생성이 실패할 수 있습니다.

3. **샘플 데이터**
   - 스크립트에 샘플 채팅방 및 메시지가 포함되어 있습니다.
   - 필요 없으면 해당 부분을 주석 처리하세요.

---

## 검증 방법

### PostgreSQL 테이블 확인

```sql
-- 테이블 목록 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 특정 테이블 구조 확인
\d users
\d interviewer_profiles

-- 인덱스 확인
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- 샘플 데이터 확인
SELECT * FROM users;
SELECT * FROM interviewer_profiles;
```

### MongoDB 인덱스 확인

```javascript
// 데이터베이스 선택
use chub;

// 컬렉션 목록 확인
show collections;

// 인덱스 확인
db.chatrooms.getIndexes();
db.messages.getIndexes();

// 샘플 데이터 확인
db.chatrooms.find().pretty();
db.messages.find().pretty();
```

---

## 백업 및 복원

### PostgreSQL 백업

```bash
# 스키마 + 데이터 전체 백업
pg_dump -U chub_user -d chub -h localhost -f chub_backup_$(date +%Y%m%d).sql

# 스키마만 백업
pg_dump -U chub_user -d chub -h localhost -s -f chub_schema_only.sql

# 데이터만 백업
pg_dump -U chub_user -d chub -h localhost -a -f chub_data_only.sql
```

### PostgreSQL 복원

```bash
# 전체 복원
psql -U chub_user -d chub -h localhost -f chub_backup.sql

# 또는 Docker에서
docker exec -i chub-postgres psql -U chub_user -d chub < chub_backup.sql
```

### MongoDB 백업

```bash
# 전체 데이터베이스 백업
mongodump --uri="mongodb+srv://chub_user:password@cluster.mongodb.net/chub" --out=dump/

# 특정 컬렉션만 백업
mongodump --uri="mongodb+srv://..." --collection=chatrooms --out=dump/
mongodump --uri="mongodb+srv://..." --collection=messages --out=dump/
```

### MongoDB 복원

```bash
# 전체 복원
mongorestore --uri="mongodb+srv://chub_user:password@cluster.mongodb.net/chub" --drop dump/chub/

# 특정 컬렉션 복원
mongorestore --uri="mongodb+srv://..." --collection=chatrooms dump/chub/chatrooms.bson
```

---

## 문제 해결

### PostgreSQL 연결 실패

```bash
# 연결 테스트
psql -U chub_user -h localhost -d chub -c "SELECT version();"

# 연결 정보 확인
psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### MongoDB 인덱스 생성 실패

```javascript
// 기존 인덱스 삭제
db.chatrooms.dropIndex("idx_room_id");

// 컬렉션 재생성
db.chatrooms.drop();
db.createCollection("chatrooms");

// 인덱스 재생성
load("mongodb_indexes.js");
```

### 권한 오류

```sql
-- PostgreSQL 권한 부여
GRANT ALL PRIVILEGES ON DATABASE chub TO chub_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chub_user;
```

```javascript
// MongoDB 권한 확인
db.runCommand({ usersInfo: "chub_user" });
```

---

## 추가 리소스

- PostgreSQL 공식 문서: https://www.postgresql.org/docs/
- MongoDB 공식 문서: https://www.mongodb.com/docs/
- Spring Data JPA: https://spring.io/projects/spring-data-jpa
- Spring Data MongoDB: https://spring.io/projects/spring-data-mongodb
