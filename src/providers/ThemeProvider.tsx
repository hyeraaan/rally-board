'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import 'nes.css/css/nes.min.css'; // 레트로 테마용 nes.css 로드

type Theme = 'classic' | 'retro';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('classic');

    useEffect(() => {
        const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('rally-board-theme') as Theme : null;
        if (savedTheme === 'classic' || savedTheme === 'retro') {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (theme === 'retro') {
            document.body.classList.add('retro-theme');
            document.body.classList.remove('classic-theme');
        } else {
            document.body.classList.add('classic-theme');
            document.body.classList.remove('retro-theme');
        }
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'classic' ? 'retro' : 'classic';
        setTheme(newTheme);
        localStorage.setItem('rally-board-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
