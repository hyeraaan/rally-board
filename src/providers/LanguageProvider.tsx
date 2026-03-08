'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ko' | 'en';

const translations = {
    ko: {
        appTitle: '랠리보드',
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
    },
    en: {
        appTitle: 'Rally Board',
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
    const [lang, setLang] = useState<Language>('ko');

    const toggleLang = () => setLang((prev) => (prev === 'ko' ? 'en' : 'ko'));

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
