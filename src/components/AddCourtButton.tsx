'use client';

import styles from './AddCourtButton.module.css';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { Plus } from 'lucide-react';

interface AddCourtButtonProps {
    onClick: () => void;
}

export default function AddCourtButton({ onClick }: AddCourtButtonProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <div
            className={`${styles.courtWrapper} ${theme === 'retro' ? 'nes-container with-title' : ''}`}
            onClick={onClick}
            style={theme === 'retro' ? { padding: '1.5rem', backgroundColor: 'transparent', border: '4px solid #212529', cursor: 'pointer' } : { cursor: 'pointer' }}
        >
            {theme === 'retro' ? (
                <h3 className="title" style={{ backgroundColor: 'white' }}>
                    {t.addCourtBtn}
                </h3>
            ) : (
                <div className={styles.courtHeader}>
                    <h3>{t.addCourtBtn}</h3>
                </div>
            )}
            
            {/* 실제 코트의 헤더 밑 마진(12px)을 gap:12px을 통해 시뮬레이션하기 위해 빈 div 추가 */}
            <div style={{ height: '0px', visibility: 'hidden' }}></div>

            <div className={styles.courtField}>
                <div className={styles.addIconWrapper}>
                    <Plus size={theme === 'retro' ? 48 : 40} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}
