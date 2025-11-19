
## 🗂️ 팀 문서 & 자료 링크

<p>
  <a href="https://www.notion.so/chub-288656e282d880bd8f9eea69aef68157">📒 팀 노션</a>&nbsp;
</p>

<br/>
<br/>

## 🧑‍💻 역할 및 기여

|담당자| 주요 작업|
|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **유윤지**  | - 이력서 관리 API 구현 (Base64 방식)<br>- 이력서 관리 API 구현 V2 (파일 시스템 기반)<br>- MultipartFile을 활용한 PDF 파일 업로드 및 저장 로직 구현<br> - 이력서 PDF 미리보기 기능 개발 (URL 기반 접근)<br>- 기존 파일 자동 삭제 및 덮어쓰기 로직 구현<br>- 면접관 프로필 생성 및 수정 API 개발<br/>- Base64 인코딩 방식에서 파일 시스템 방식으로 마이그레이션하여 성능 최적화                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **강진규**  | - 모의 투자 자체 체결 엔진 전반 개발<br>- [TimescaleDB 연동을 통한 시계열 데이터 최적화](https://velog.io/@jin0410/TimescaleDB-%EC%82%AC%EC%9A%A9%EC%9D%84-%EA%B3%A0%EB%AF%BC%ED%95%98%EA%B3%A0-%EA%B3%84%EC%8B%A0%EA%B0%80%EC%9A%94)<br>- 매수/매도 및 지정가/시장가 주문 로직 구현<br>- 주문 취소, 정정 및 조회 기능 구현<br>- 호가, 체결가 이벤트 발행 로직 설계 및 구현<br>- 백엔드 테스트 코드 작성<br>- [증권사 API 연동](https://velog.io/@jin0410/%EC%82%AC%EB%A6%AC%EC%A7%84-2%EC%A3%BC%EC%B0%A8-%EC%B0%BE%EC%95%84%EC%9A%94#%EC%99%B8%EB%B6%80-api-%ED%98%B8%EC%B6%9C-%EB%A1%9C%EC%A7%81-%ED%85%8C%EC%8A%A4%ED%8A%B8)                                                                   |
| **김현수**  | - 실시간 채팅 시스템 (MongoDB + WebSocket) 설계 및 구현<br> - MongoDB 복합 인덱스를 활용한 메시지 정렬 최적화<br>- 읽음/안읽음 추적 기능 구현 (Lazy Loading 방식)<br> - 사용자 조회시간, 새 메시지 등록시간, 안읽음 카운트 시간 기반 캐싱 전략으로 성능 최적화<br> - WebSocket 기반 읽음 상태 실시간 동기화<br>- 커서 기반 페이지네이션 설계 (실시간 메시지 조회 최적화)<br>- 백엔드 계층별 단위 테스트 코드 작성(TDD) |
| **김형진**  | - 사이드바 콘텐츠(내 투자, 관심 종목, 최근 본 종목, 실시간 차트, 챗봇) 구현<br>- 사이드바 콘텐츠 별 전용 스켈레톤 구현<br>- API 구현 및 react suspenseQuery를 이용한 최적화<br>- 체결 통보 토스트 알림 구현<br>- 대회 정보 / 대회 랭킹 / 대회 디테일 페이지 구현<br>- Zustand를 활용한 상태 관리<br>- React Testing Library를 이용한 컴포넌트 단위 테스트 작성(TDD)|
| **배수한**  | - ERD 설계 및 데이터베이스 구조화<br>- 대회/마이페이지 중심 REST API 설계 및 구현<br>- 내부 비즈니스 로직 및 재사용 함수 설계<br>- 스냅샷 로직 설계 (자산 상태 저장/조회)<br>- OpenAI API 연동 기반 챗봇 기능 구현<br>- 각 컨트롤러, 서비스, 리포지토리 단위 테스트 코드 작성(TDD)|
| **이  찬** | - 현직자 멘토링|

<br/>
<br/>

## 👋 프로젝트 소개

### 📊 *"면접관-취준생 모의 면접 매칭 플랫폼"*

**Chub**는 면접관과 취준생을 연결하여,
**실제 면접과 같은 경험**을 제공하는 **모의 면접 플랫폼**입니다.

- **WebRTC 기반 영상/음성 통화**와 **실시간 채팅**으로 생생한 면접 환경을 제공해요.
- **비휘발성 실시간 채팅**으로 면접 일정을 정하거나 면접 조언을 주고받을 수 있어요.
- **이력서 업로드 및 관리** 기능으로 효율적인 면접 준비가 가능해요.
- **STT로 변환된 질문 & 답변을 저장**하여 나중에 면접을 복기할 수 있어요.
- **Kakao OAuth2 인증**으로 안전하고 간편하게 로그인할 수 있어요.


## 🧩 **고민과 해결 방안**

### 🚀 **프론트**

### 🛡️ **백**
### 🔄 **WebSocket 재연결 전략으로 안정적인 면접 환경 구축**

실시간 면접 시스템에서 네트워크 불안정이나 브라우저 강제 종료로 인한 WebSocket 연결 끊김은 치명적인 문제였습니다. 연결이 끊어지면 진행 중인 면접이 중단되고, 사용자는 처음부터 다시 시작해야 하는 상황이 발생할 수 있었습니다.

전통적인 heartbeat나 ping/pong 방식은 지속적인 메시지 교환으로 인한 오버헤드가 발생했고, 우리 서비스의 특성상 대부분의 이벤트가 broadcast되어 즉각적인 연결 끊김 감지가 어려웠습니다.

이를 해결하기 위해 **"마지막 이벤트 재발송"** 전략을 도입했습니다. 각 사용자별로 마지막 발생 이벤트를 메모리에 저장하고, 재연결 시 해당 이벤트를 재전송하여 끊어진 지점부터 자연스럽게 이어갈 수 있도록 구현했습니다.

JWT 기반 사용자 인증과 userId 매핑을 통해 재연결 시 이전 세션 상태를 정확히 복구할 수 있었고, 연결 상태 모니터링 오버헤드 없이도 빠른 재연결이 가능한 안정적인 면접 환경을 구축했습니다.

[Wiki로 자세히 보기](https://lab.ssafy.com/s13-fintech-finance-sub1/S13P21A508/-/wikis/%F0%9F%9A%80-%EC%8B%9C%EA%B3%84%EC%97%B4-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C-%EC%84%B1%EB%8A%A5-%EC%B5%9C%EC%A0%81%ED%99%94)
<br/>

### 🔄 **이중 타임스탬프 캐싱 전략을 통한 채팅 미읽음 조회 속도 개선**

실시간 채팅 시스템에서 읽음/안읽음 상태를 정확히 추적하는 것은 사용자 경험의 핵심입니다. 

채팅방 목록 조회할 때마다 안읽은 메시지를 카운트하거나, 메시지 전송 시 미읽음 카운트를 증가시키고 사용자가 메시지를 읽을 때마다 카운트를 초기화하며, 메모리에만 저장해 성능 저하와 동시성 문제를 야기했습니다.

이를 해결하기 위해 **이중 타임스탬프 캐싱 전략**을 도입했습니다. `안읽은 메시지 수`, `마지막 읽음 시간`, `마지막 계산 시간`, `마지막 메시지 생성 시간` 필드를 통해 읽음 상태를 추적하고, 계산 시간과 메시지 생성 시간을 비교해 불필요한 재계산을 방지합니다.

이를 통해 MongoDB 원자적 업데이트로 동시 접근 시 데이터 일관성을 보장하고, countedAt 체크로 불필요한 DB 쿼리를 스킵하여 채팅방 목록 조회를 O(1)의 시간 복잡도로 개선했습니다.


[Wiki로 자세히 보기](https://lab.ssafy.com/s13-final/S13P31A707/-/wikis/Lazy-Loading-%EA%B8%B0%EB%B0%98-%EB%AF%B8%EC%9D%BD%EC%9D%8C-%EC%B6%94%EC%A0%81%EC%9C%BC%EB%A1%9C-%EB%B9%A0%EB%A5%B8-%EC%B1%84%ED%8C%85-%ED%99%98%EA%B2%BD-%EA%B5%AC%EC%B6%95)
<br/>



<br/>
<br/>

## 🎯 주요 기능 소개

### 🎥 면접 진행 & STT 기반 기록
> **"모든 질문과 답변을 자동으로 저장해요!"**

**WebRTC 화상통화**로 실제 면접과 동일한 환경을 제공하며,  
**STT(Speech-to-Text) 기능**으로 음성 질문과 답변을 **자동으로 텍스트로 변환**합니다.  
**변환된 질문 & 답변을 저장**하여 면접 후 언제든지 복기하고 자신의 답변을 분석할 수 있어요.

<p align="center">
  <img src="https://raw.githubusercontent.com/llcodingll/kkori_img/main/카카오로그인.gif" width="70%" alt="카카오 소셜 로그인" />
</p>

### 💬 실시간 채팅 시스템
> **"면접 중에도, 면접 전후로도 소통할 수 있어요!"**

**WebSocket 기반 실시간 채팅**으로 면접 진행 중 **참여자들이 즉시 소통**할 수 있습니다.  
**NoSQL 기반 비휘발성 채팅**으로 면접 전후에도 **지속적인 커뮤니케이션**을 지원하며,  
**읽음/안읽음 추적** 기능으로 메시지 상태를 파악할 수 있어요.

<p align="center">
  <img src="https://raw.githubusercontent.com/llcodingll/kkori_img/main/실시간채팅시스템.gif" width="70%" alt="실시간 채팅 시스템" />
</p>

<br/>

### 💼 면접관 프로필 & 이력서 관리
> **"체계적인 프로필 관리로 최적의 매칭을!"**

**면접관의 상세 프로필 정보** (회사, 직급, 경력, 부서, 전문분야, 가능한 시간대)를 관리하고,  
**분야별 검색 & 필터링**으로 최적의 면접관을 찾을 수 있습니다.  
**취준생의 이력서** (PDF 업로드, 자동 파일 저장 및 검증)를 효율적으로 관리해요.

<p align="center">
  <img src="https://raw.githubusercontent.com/llcodingll/kkori_img/main/카카오로그인.gif" width="70%" alt="카카오 소셜 로그인" />
</p>

### 🔐 카카오 소셜 로그인
> **"간편하고 안전한 로그인!"**

**카카오 OAuth2 연동**으로 복잡한 회원가입 절차 없이 원클릭으로 빠른 로그인이 가능합니다.  
JWT 토큰 기반 인증으로 보안성을 보장하며, 리프레시 토큰을 통해 안정적인 세션 관리를 제공해요.

<p align="center">
  <img src="https://raw.githubusercontent.com/llcodingll/kkori_img/main/카카오로그인.gif" width="70%" alt="카카오 소셜 로그인" />
</p>



## ✅ 서비스 구조도

<img src="assets/architecture.png" width="700" alt="tumolow 서비스 아키텍처" />

<br/>
<br/>

## ⚒️ Tech Stacks

| 분류 | 기술 스택                                                                                              |
|------|----------------------------------------------------------------------------------------------------|
| **Frontend** | [![My Skills](https://skillicons.dev/icons?i=react,vite,tailwind,ts,nodejs)](https://skillicons.dev) |
| **Backend** | [![My Skills](https://skillicons.dev/icons?i=java,spring,hibernate)](https://skillicons.dev)       |
| **Database / Infra** | [![My Skills](https://skillicons.dev/icons?i=postgres,mongo,nginx,aws)](https://skillicons.dev)    |
| **배포** | [![My Skills](https://skillicons.dev/icons?i=docker,jenkins)](https://skillicons.dev)              |
| **협업 / 개발도구** | [![My Skills](https://skillicons.dev/icons?i=git,gitlab,notion,jira)](https://skillicons.dev)      |

<br/>
<br/>

## 🤼 팀원 소개

|유윤지|강진규|김현수|김형진|배수한|
|:---:|:---:|:---:|:---:|:---:|
| <img src="https://avatars.githubusercontent.com/u/105447233?v=4" width="120"> | <img src="https://avatars.githubusercontent.com/u/64190888?v=4" width="120">  | <img src="https://avatars.githubusercontent.com/u/95575606?v=4" width="120"> | <img src="https://avatars.githubusercontent.com/u/49364688?v=4" width="120">  | <img src="https://avatars.githubusercontent.com/u/128581113?v=4" width="120">  |
|**Backend**|**Backend**|**Backend**|**Frontend**|**Backend**|
|[@llcodingll](https://github.com/llcodingll)|[@jin0410](https://github.com/jin0410)|[@hanskim431](https://github.com/hanskim431)|[@hyeongjin-kim](https://github.com/hyeongjin-kim)|[@SwnBae](https://github.com/SwnBae)|