# BoothConnect — B2B 이벤트 플랫폼 데모

QR 기반 B2B 이벤트 부스 관리 플랫폼 프로토타입입니다. 백엔드 없이 `localStorage`로 동작합니다.

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 데모 사용법

### 관람객 체험 (모바일 화면 기준)
1. **`/scan/booth-001`** — QR 스캔 랜딩 페이지. 방문이 자동 기록되고 통계에 반영됩니다.
   - 부스 이미지 / 소개 / 링크 / FAQ 확인
   - **"저장하기"** 버튼으로 관심 부스 등록 (하트 토글)
   - **"문의하기"** 버튼으로 메시지 전송 (로그인 불필요)
   - 상단 우측 **로그인 토글**로 비로그인 ↔ 로그인 전환

2. **`/me`** — 내 부스 히스토리 & 관심 목록
   - 탭 전환: 최근 본 부스 / 관심 부스

3. **`/messages`** — 문의 내역 & 채팅 UI
   - 로그인 상태에서 "새 답변" 뱃지 확인
   - 스레드 클릭 → 추가 메시지 전송 가능

### 운영자 체험 (데스크톱 레이아웃)
1. **`/admin/login`** — "데모 로그인으로 시작하기" 클릭
2. **`/admin/booths`** — 부스 목록 및 전체 통계 요약
3. **`/admin/booths/new`** — 부스 폼 작성 → 저장 시 QR 즉시 발급
4. **`/admin/booths/:id`** — QR PNG 다운로드 / 통계 카드 / CSV Export
5. **`/admin/inbox`** — 문의 인박스
   - 상태 필터 (미처리 / 처리 / 보류)
   - 키워드 검색
   - 태그 추가 / 상태 변경 / 내부 메모
   - 템플릿 답변 버튼 3개 (자동 입력 후 전송)
   - 관람객 `/messages`에 실시간 반영
6. **`/organizer/preview`** — KPI 요약 + 부스별 순위 + 전체 CSV Export

### seed 부스 목록
| ID | 이름 | 카테고리 |
|---|---|---|
| booth-001 | TeaCo | 음료 & 식품 |
| booth-002 | BrandKit Studio | 인쇄 & 굿즈 |
| booth-003 | GreenSpace | 친환경 오피스 |
| booth-004 | DataFlow | IT & SaaS |
| booth-005 | CraftLeather | 핸드크래프트 |
| booth-006 | NutritionLab | 웰니스 & 복지 |

> localStorage 초기화: 브라우저 DevTools → Application → Local Storage → `bep_seeded` 삭제 후 새로고침

---

## 기술 스택

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** (포인트 컬러: indigo-600)
- **react-router-dom v6** (클라이언트 라우팅)
- **qrcode.react** (실제 QR 코드 생성 + PNG 다운로드)
- **lucide-react** (아이콘)
- **localStorage** (모든 데이터 영속성)
