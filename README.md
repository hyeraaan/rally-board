# 🎾 랠리보드 (Rally Board)

배드민턴 경기 운영을 위한 스마트 전역 상태 스코어보드 및 대기 명단 관리 시스템입니다. 

## 🌟 프로젝트 개요
랠리보드는 배드민턴 동호회나 소규모 대회에서 코트 현황과 대기 명단을 효율적으로 관리하기 위해 개발되었습니다. 
직관적인 드래그 앤 드롭 인터페이스와 테마 전환 기능을 제공하며, 사용자의 데이터가 로컬에 안전하게 보존됩니다.

## 📖 주요 문서 (Documentation)
프로젝트에 대한 상세 내용은 아래 가이드를 참고해 주세요:

1. [**Architecture**](./docs/architecture.md) - 시스템 구조, 상태 관리, 핵심 기술 스택
2. [**Features**](./docs/features.md) - 대기 명단 관리, 벌크 추가, 영속성 정책, 테마 시스템
3. [**Development Guide**](./docs/development.md) - 환경 설정, 코딩 컨벤션, 스타일 가이드, 배포 방법

## 🚀 빠른 시작 (Quick Start)

### 설치 및 실행
```bash
npm install
npm run dev
```

### 주요 기능 활용 팁
- **대량 추가:** 선수 추가 입력창에 `A 이름, B 이름` 처럼 콤마로 구분하여 입력하면 한 번에 여러 명을 등록할 수 있습니다.
- **퀵 배치:** 선수 네임택의 등급(A~E) 영역을 클릭하면 즉시 비어있는 코트로 배치할 수 있는 레이어가 나타납니다.
- **테마 전환:** 상단 아이콘이나 단축키(`N`)를 통해 클래식 모드와 레트로 모드를 전환할 수 있습니다.

## 🛠️ 기술 스택
- **Framework:** Next.js 15 (App Router)
- **State:** Zustand (with Persist Middleware)
- **Drag & Drop:** @dnd-kit
- **Styling:** Vanilla CSS Modules, nes.css (Retro Theme)

---
© 2024 Rally Board Project. 오픈소스 기여와 피드백은 언제나 환영합니다! 🏸
