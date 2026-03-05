# BoothLiner 디자인 시스템 리팩토링 가이드

## 1. Tailwind Config 토큰 정비

### 컬러
- **Primary**: brand-600 `#4f46e5` (기존 유지)
- **Gray**: Tailwind 기본 gray 사용 (50~900)
- **Success**: emerald-600 `#059669` — 모든 green-* 사용 금지, emerald로 통일
- **Warning**: amber-600 `#d97706`
- **Error**: red-600 `#dc2626`
- 사용 금지: blue-*, pink-*, purple-*, violet-*, green-* (시맨틱 토큰 외 직접 사용 불가)

### Border Radius
- `radius-sm`: 8px (`rounded-lg`) — 버튼, 인풋, 뱃지
- `radius-md`: 12px (`rounded-xl`) — 카드, 모달, 드롭다운, 썸네일
- `rounded-full` — 아바타, 도트 인디케이터에만 사용
- 사용 금지: `rounded-2xl`, `rounded-3xl`

### Shadow
- `shadow-card`: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- `shadow-card-hover`: `0 4px 12px rgba(0,0,0,0.08)`
- 사용 금지: `shadow-lg`, `shadow-xl`, `shadow-md`, `shadow-sm`

### Typography (5단계)
- `heading-lg`: text-xl (20px), font-bold
- `heading-sm`: text-base (16px), font-semibold
- `body`: text-sm (14px), font-normal
- `label`: text-[13px], font-medium
- `caption`: text-xs (12px), font-normal
- 사용 금지: `text-2xl`, `text-lg`, `text-[10px]`, `text-[9px]`

### Spacing (8pt Grid)
- 패딩: p-2(8), p-3(12), p-4(16), p-6(24), p-8(32)
- 사용 금지: p-5(20), py-2.5(10), py-3.5(14) 등 비정규값

### Component Sizing
- 버튼 높이: h-10 (40px), sm: h-8 (32px)
- 인풋 높이: h-10 (40px), sm: h-8 (32px)

---

## 2. 공유 UI 컴포넌트 (src/components/ui/)

### Button
- Variants: primary, secondary, ghost, danger
- Sizes: sm (h-8), md (h-10)
- States: hover, focus-visible, disabled, loading

### Input
- Default: h-10, bg-white, border border-gray-200, rounded-lg
- States: focus (ring-2 ring-brand-200), error (border-red-500), disabled

### Badge
- Variants: primary, success, warning, error, neutral
- 고정: h-6, px-2, rounded-lg, text-xs font-medium

### Card
- Default: bg-white border border-gray-200 rounded-xl shadow-card p-6
- Clickable: hover:shadow-card-hover transition-all

### EmptyState
- 패턴: icon(20px, text-gray-300) + message(text-sm, text-gray-400) + CTA(optional)

---

## 3. 리팩토링 체크리스트

### 전역
- [ ] tailwind.config.js 업데이트
- [ ] index.css: focus-visible 글로벌 스타일 추가
- [ ] 공유 컴포넌트 5개 생성

### 레이아웃
- [ ] AdminLayout: rounded-xl 통일, text-[10px] 제거
- [ ] VisitorHeader: text-[10px]/[9px] 제거, 아이콘 크기 통일
- [ ] Modal: rounded-xl, 패딩 p-6 통일

### Admin 페이지
- [ ] AdminLoginPage: gradient 제거 → bg-gray-50
- [ ] AdminBoothsPage: 인라인 버튼/뱃지 → 공유 컴포넌트
- [ ] AdminBoothDetailPage: 색상 통일 (blue/pink/green → 토큰)
- [ ] AdminBoothNewPage: FieldLabel/TextInput → 공유 컴포넌트
- [ ] AdminInboxPage: StatusBadge → 공유 Badge
- [ ] AdminLeadsPage: 인라인 모달 → 공유 Modal
- [ ] AdminLeadsScanPage: 색상 통일
- [ ] AdminBoothTeamPage: RoleBadge/StatusBadge → 공유 Badge

### Visitor 페이지
- [ ] BoothPage: 버튼 bg-gray-900 → primary, gradient 제거
- [ ] MyPage: BoothCard → 공유 Card 기반
- [ ] MessagesPage: 인라인 뱃지 → 공유 Badge
- [ ] NotificationsPage: 카드 스타일 통일

### Auth 페이지
- [ ] AuthPage: gradient 제거 → bg-gray-50, rounded-3xl → rounded-xl
- [ ] SignupPage: 동일
- [ ] OAuthPage: 동일

### Organizer
- [ ] OrganizerPreviewPage: 색상 통일, 카드 라운드 통일

---

## 4. 카피 톤 통일

- 이모지 사용 금지 (텍스트 이모지 🎪 등 제거)
- 존대 '~해요' 톤 통일
- CTA 동사: "만들기", "저장", "보내기" 등 명사형 통일
- "없어요" 패턴 유지 (B2B라도 친근한 톤)
