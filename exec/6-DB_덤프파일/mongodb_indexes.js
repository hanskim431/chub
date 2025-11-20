// ============================================
// CHUB Interview Platform - MongoDB Indexes
// ============================================
// 데이터베이스: chub
// MongoDB 버전: 5.0+
// 컬렉션: chatrooms, messages
// ============================================

// 데이터베이스 선택
use chub;

// ============================================
// 1. chatrooms 컬렉션 인덱스
// ============================================

print("Creating indexes for chatrooms collection...");

// 1-1. room_id 고유 인덱스 (필수)
db.chatrooms.createIndex(
    { "room_id": 1 },
    {
        unique: true,
        name: "idx_room_id",
        background: true
    }
);
print("✓ Created unique index on room_id");

// 1-2. participantIds + updatedAt 복합 인덱스
// 용도: 특정 사용자의 채팅방 목록 조회 (최신순)
db.chatrooms.createIndex(
    { "participantIds": 1, "updatedAt": -1 },
    {
        name: "idx_participants_updated",
        background: true
    }
);
print("✓ Created compound index on participantIds + updatedAt");

// 1-3. room_id + updatedAt 복합 인덱스
// 용도: 채팅방 정보 조회 및 정렬
db.chatrooms.createIndex(
    { "room_id": 1, "updatedAt": -1 },
    {
        name: "idx_room_updated",
        background: true
    }
);
print("✓ Created compound index on room_id + updatedAt");

// ============================================
// 2. messages 컬렉션 인덱스
// ============================================

print("\nCreating indexes for messages collection...");

// 2-1. room_id + created_at 복합 인덱스 (중요!)
// 용도: 채팅방별 메시지 조회 (시간순)
db.messages.createIndex(
    { "room_id": 1, "created_at": -1 },
    {
        name: "idx_room_created",
        background: true
    }
);
print("✓ Created compound index on room_id + created_at");

// 2-2. message_from + created_at 복합 인덱스
// 용도: 사용자별 전송 메시지 조회
db.messages.createIndex(
    { "message_from": 1, "created_at": -1 },
    {
        name: "idx_from_created",
        background: true
    }
);
print("✓ Created compound index on message_from + created_at");

// ============================================
// 3. 인덱스 확인
// ============================================

print("\n========================================");
print("Indexes for chatrooms collection:");
print("========================================");
db.chatrooms.getIndexes().forEach(function(index) {
    print("Index: " + index.name);
    print("  Keys: " + JSON.stringify(index.key));
    if (index.unique) print("  Unique: true");
    print("");
});

print("========================================");
print("Indexes for messages collection:");
print("========================================");
db.messages.getIndexes().forEach(function(index) {
    print("Index: " + index.name);
    print("  Keys: " + JSON.stringify(index.key));
    print("");
});

// ============================================
// 4. 인덱스 사용 통계 확인 (참고)
// ============================================

print("========================================");
print("Index usage statistics:");
print("========================================");

// chatrooms 컬렉션 인덱스 통계
var chatroomStats = db.chatrooms.aggregate([
    { $indexStats: {} }
]).toArray();

print("\nchatrooms collection:");
chatroomStats.forEach(function(stat) {
    print("  " + stat.name + ": " + stat.accesses.ops + " operations");
});

// messages 컬렉션 인덱스 통계
var messageStats = db.messages.aggregate([
    { $indexStats: {} }
]).toArray();

print("\nmessages collection:");
messageStats.forEach(function(stat) {
    print("  " + stat.name + ": " + stat.accesses.ops + " operations");
});

// ============================================
// 5. 샘플 데이터 삽입 (개발/테스트용)
// ============================================

print("\n========================================");
print("Inserting sample data (optional)...");
print("========================================");

// 샘플 채팅방 1
db.chatrooms.insertOne({
    room_id: "user1_user2",
    participantIds: [1, 2],
    participants: {
        "1": {
            unreadCount: 0,
            lastReadAt: new Date(),
            countedAt: new Date()
        },
        "2": {
            unreadCount: 0,
            lastReadAt: new Date(),
            countedAt: new Date()
        }
    },
    lastMessage: "안녕하세요, 면접 일정 조율 가능할까요?",
    updatedAt: new Date()
});
print("✓ Inserted sample chatroom: user1_user2");

// 샘플 메시지 1
db.messages.insertOne({
    room_id: "user1_user2",
    message_from: 1,
    content: "안녕하세요, 면접 일정 조율 가능할까요?",
    created_at: new Date()
});
print("✓ Inserted sample message from user 1");

// 샘플 메시지 2
db.messages.insertOne({
    room_id: "user1_user2",
    message_from: 2,
    content: "네, 다음 주 화요일 오후 2시는 어떠신가요?",
    created_at: new Date()
});
print("✓ Inserted sample message from user 2");

// ============================================
// 6. 쿼리 성능 테스트 (참고)
// ============================================

print("\n========================================");
print("Query performance test:");
print("========================================");

// 특정 사용자의 채팅방 목록 조회
print("\nQuery: Find chatrooms for user 1");
var explainResult = db.chatrooms.find({ participantIds: 1 }).sort({ updatedAt: -1 }).explain("executionStats");
print("  Execution time: " + explainResult.executionStats.executionTimeMillis + " ms");
print("  Documents examined: " + explainResult.executionStats.totalDocsExamined);
print("  Index used: " + (explainResult.executionStats.totalDocsExamined === explainResult.executionStats.nReturned ? "Yes" : "No"));

// 특정 채팅방의 메시지 조회
print("\nQuery: Find messages for room user1_user2");
var explainResult2 = db.messages.find({ room_id: "user1_user2" }).sort({ created_at: -1 }).explain("executionStats");
print("  Execution time: " + explainResult2.executionStats.executionTimeMillis + " ms");
print("  Documents examined: " + explainResult2.executionStats.totalDocsExamined);
print("  Index used: " + (explainResult2.executionStats.totalDocsExamined === explainResult2.executionStats.nReturned ? "Yes" : "No"));

// ============================================
// 7. 유지보수 명령어 (참고)
// ============================================

print("\n========================================");
print("Maintenance commands (reference):");
print("========================================");

print("\n// 인덱스 재구성 (성능 저하 시)");
print("db.chatrooms.reIndex();");
print("db.messages.reIndex();");

print("\n// 컬렉션 통계 확인");
print("db.chatrooms.stats();");
print("db.messages.stats();");

print("\n// 인덱스 삭제 (필요 시)");
print("db.chatrooms.dropIndex('idx_room_id');");
print("db.messages.dropIndex('idx_room_created');");

print("\n// 컬렉션 전체 삭제 (주의!)");
print("db.chatrooms.drop();");
print("db.messages.drop();");

print("\n========================================");
print("MongoDB indexes setup completed!");
print("========================================");
