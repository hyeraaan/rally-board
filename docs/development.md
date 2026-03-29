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
- **환경 변수:** 인증 버전(`feature/google-auth`) 배포 시에는 `.env.local`의 모든 값을 Vercel 환경 변수에 등록해야 합니다.

## 6. 브랜치 관리 및 기능 통합 (Branch Strategy) [NEW]
랠리보드는 두 가지 버전을 독립적으로 운영합니다:
- **`main` (공개 버전):** 로그인 없이 누구나 사용할 수 있는 기본 버전입니다.
- **`feature/google-auth` (인증 버전):** 구글 로그인 및 승인 기능이 적용된 보안 버전입니다.

### 🔄 새로운 기능을 양쪽 브랜치에 적용하는 방법
1.  **공통 기능 개발:** 새로운 점수판 디자인이나 게임 관리 기능 등은 **`main` 브랜치에서 먼저 작업**하고 커밋합니다.
2.  **인증 브랜치로 기능 가져오기:** `main`의 최신 기능을 인증 브랜치에 합칩니다.
    ```bash
    git checkout feature/google-auth
    git merge main
    ```
3.  **충돌 처리:** 인증 관련 파일(`middleware.ts`, `auth.ts` 등)은 `main`에 없으므로 대부분 자동으로 병합됩니다. 만약 충돌이 발생하면 `auth` 브랜치의 설정을 유지하며 병합합니다.
