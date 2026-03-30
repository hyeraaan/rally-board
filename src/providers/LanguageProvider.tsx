'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ko' | 'en';

const translations = {
    ko: {
        appTitle: '랠리보드',
        documentTitle: '랠리보드 - 배드민턴 자석 보드',
        courtArea: '코트',
        waitingList: '대기 명단',
        waiting: '대기중',
        switchToRetro: '레트로 모드로 전환',
        switchToClassic: '클래식 모드로 전환',
        randomMatchBtn: '랜덤 매칭',
        historyBtn: '기록',
        addCourtBtn: '코트 추가',
        playerNamePlaceholder: '이름',
        addBtn: '추가',
        cancelBtn: '취소',
        startGame15m: '시작',
        startGame: '시작',
        endGame: '종료',
        endGameEarlyTitle: '게임 조기 종료',
        endGameRetroTitle: '게임 종료 및 명단 복귀',
        playerCount: (count: number, max: number) => `${count} / ${max} 명`,
        matchStartBtn: '경기 시작',
        matchEndBtn: '경기 종료',
        tournamentStart: '경기 시작',
        tournamentEnd: '경기 종료',
        waitingTime: (min: number) => `${min}분`,
        endGameConfirm: '경기를 종료하시겠습니까? 종료된 선수는 대기 명단으로 이동합니다.',
        confirmBtn: '확인',
        cancelModalBtn: '취소',
        historyTitle: '매칭 기록',
        noHistory: '오늘 진행된 매칭이 없습니다.',
        courtLabel: '코트',
        tournamentEndConfirm: '정말 대회를 종료하시겠습니까? 모든 정보가 초기화됩니다.',
        alertMaxPlayers: '최대 4명까지만 선택 가능합니다.',
        endTournamentTooltip: '전체 대회를 종료합니다.',
        startTournamentTooltip: '대회를 시작하고 대기 시간을 측정합니다.',
        historyTooltip: '오늘 하루 게임을 진행한 매칭 기록을 확인합니다.',
        closeWaitingListTooltip: '대기명단 닫기',
        openWaitingListTooltip: '대기명단 열기',
        courtNumber: (id: number) => `${id}번 코트`,
        addPlayerTooltip: '선수 추가',
        emptyWaitingList: '대기 명단이 비어있습니다',
        addPlayerGuide: '상단 우측의 [+] 버튼을 눌러 선수를 추가할 수 있습니다.',
        addPlayerTip: '"a 서준, b 지아" 처럼 입력하면 한 번에 추가 가능!',
        addPlayerTitle: '선수 추가',
        bulkAddPlaceholder: '예: a 서준, b 지아',
        bulkAddBtnText: '일괄 추가',
        clearAllConfirm: '모든 대기 명단을 삭제하시겠습니까?',
        clearAllTooltip: '전체 명단 삭제',
        randomMatchTooltip: '빈 코트에 인원을 랜덤으로 채웁니다.',
        confirmTitle: '알림',
        settingsTitle: '설정 및 관리',
        settingsTooltip: '설정 (전체 데이터 초기화)',
        dangerZoneTitle: '초기화 위험 구역',
        dangerZoneDesc: '모든 선수 명단, 진행 중인 코트 현황, 종료된 매치 기록을 영구적으로 삭제하고 앱을 초기 상태로 되돌립니다.',
        resetAllBtn: '전체 데이터 초기화',
        resetConfirmMsg: '정말 모든 기록과 대기 명단, 코트 현황을 완전히 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.',
        resetSuccessMsg: '모든 데이터가 성공적으로 초기화되었습니다.',
        tournamentTitlePlaceholder: '대회 이름을 입력하세요',
    },
    en: {
        appTitle: 'Rally Board',
        documentTitle: 'Rally Board - Badminton Magnet Board',
        courtArea: 'Courts',
        waitingList: 'Waiting',
        waiting: 'Open',
        switchToRetro: 'Switch to Retro',
        switchToClassic: 'Switch to Classic',
        randomMatchBtn: 'Random',
        historyBtn: 'History',
        addCourtBtn: 'Add Court',
        playerNamePlaceholder: 'Name',
        addBtn: 'Add',
        cancelBtn: 'Cancel',
        startGame15m: 'Start',
        startGame: 'Start',
        endGame: 'End',
        endGameEarlyTitle: 'End game early',
        endGameRetroTitle: 'End game & return to list',
        playerCount: (count: number, max: number) => `${count} / ${max} Players`,
        matchStartBtn: 'Start Session',
        matchEndBtn: 'End Session',
        tournamentStart: 'Match Start',
        tournamentEnd: 'Match End',
        waitingTime: (min: number) => `${min}m`,
        endGameConfirm: 'Do you want to end the match? The players will return to the waiting list.',
        confirmBtn: 'Confirm',
        cancelModalBtn: 'Cancel',
        historyTitle: 'Match History',
        noHistory: 'No matches played today.',
        courtLabel: 'Court',
        tournamentEndConfirm: 'End the tournament? All status will be reset.',
        alertMaxPlayers: 'You can select up to 4 players.',
        endTournamentTooltip: 'Ends the entire tournament.',
        startTournamentTooltip: 'Starts the tournament and measures waiting time.',
        historyTooltip: 'Checks the match history for today.',
        closeWaitingListTooltip: 'Close Waiting List',
        openWaitingListTooltip: 'Open Waiting List',
        courtNumber: (id: number) => `Court ${id}`,
        addPlayerTooltip: 'Add Player',
        emptyWaitingList: 'LIST IS EMPTY!',
        addPlayerGuide: 'Click the [+] button at the top right to add players.',
        addPlayerTip: '"A John, B Doe" format adds multiple players!',
        addPlayerTitle: 'Add Player',
        bulkAddPlaceholder: 'e.g. A John, B Doe',
        bulkAddBtnText: 'Bulk Add',
        clearAllConfirm: 'Clear all players from the list?',
        clearAllTooltip: 'Clear All',
        randomMatchTooltip: 'Fill empty spots randomly.',
        confirmTitle: 'Notice',
        settingsTitle: 'Settings & Management',
        settingsTooltip: 'Settings (Factory Reset)',
        dangerZoneTitle: 'Danger Zone',
        dangerZoneDesc: 'Permanently deletes all player lists, ongoing court statuses, and completed match records, reverting the app to its initial state.',
        resetAllBtn: 'Factory Reset All Data',
        resetConfirmMsg: 'Are you sure you want to completely reset all records, waiting lists, and court statuses?\n\nThis action cannot be undone.',
        resetSuccessMsg: 'All data has been successfully reset.',
        tournamentTitlePlaceholder: 'Enter tournament title',
    },
};

type Translations = typeof translations.ko;

interface LanguageContextType {
    lang: Language;
    t: Translations;
    toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>('ko'); // 한국어 기본

    useEffect(() => {
        const savedLang = localStorage.getItem('rally-board-lang') as Language;
        if (savedLang === 'ko' || savedLang === 'en') {
            setLang(savedLang);
        }
    }, []);

    const toggleLang = () => {
        const newLang = lang === 'ko' ? 'en' : 'ko';
        setLang(newLang);
        localStorage.setItem('rally-board-lang', newLang);
    };

    return (
        <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
