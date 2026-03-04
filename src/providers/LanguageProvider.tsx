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
        playerCount: (count: number, max: number) => `${count}/${max}`,
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
        playerCount: (count: number, max: number) => `${count}/${max}`,
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
    const [lang, setLang] = useState<Language>('en');

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
