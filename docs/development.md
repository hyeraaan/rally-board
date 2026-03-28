# Development Guide 🛠️

랠리보드 프로젝트의 개발 환경 설정 및 기여 방법입니다.

## 1. 환경 설정 (Environment Setup)
- **Node.js:** 20.x 이상 (Next.js 15 호환용)
- **패키지 매니저:** `npm` (또는 `yarn`, `pnpm`)

### 시작하기
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 빌드 및 프로덕션 확인
npm run build
npm run start
```

## 2. 코딩 규칙 (Coding Conventions)
- **TypeScript:** 모든 컴포넌트와 유틸리티는 타입 정의가 필수입니다.
- **Component Folder:** `src/components` 하위에 컴포넌트명으로 분류합니다.
- **State Management:** 전역 상태는 `useBoardStore.ts`만 사용하며, 지역 상태(`useState`)는 가급적 컴포넌트 내부에 한정합니다.

## 3. 스타일 가이드 (Styling)
- **Vanilla CSS Modules:** `ComponentName.module.css` 형식을 사용합니다.
- **CSS Variables:** 테마별 색상은 `globals.css` 또는 `ThemeProvider`에서 정의한 변수를 사용합니다.
- **Tailwind 미사용:** 프로젝트 전체의 디자인 일관성을 위해 Tailwind CSS 사용을 금지합니다.

## 4. 커밋 컨벤션 (Commit Convention)
- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 수정
- `refactor:` 코드 리팩토링
- `style:` 스타일 관련 수정 (코드 변경 없음)

## 5. 배포 가이드 (Deployment)
- **플랫폼:** Vercel 추천 (Next.js 최적화)
- **환경 변수:** 특별한 환경 변수는 필요하지 않으나, 향후 API 연동 시 `.env.local`에 정의합니다.
