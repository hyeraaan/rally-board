'use client';

import styles from './AddCourtButton.module.css';
import courtStyles from './BadmintonCourt.module.css';
import { useTheme } from '@/providers/ThemeProvider';

interface AddCourtButtonProps {
    onClick: () => void;
}

export default function AddCourtButton({ onClick }: AddCourtButtonProps) {
    const { theme } = useTheme();

    return (
        <div
            className={
                theme === 'retro'
                    ? `nes-container with-title ${styles.addCourtWrapper}`
                    : `${courtStyles.courtWrapper} ${styles.addCourtWrapper}`
            }
            style={theme === 'retro' ? { padding: '1.5rem', backgroundColor: 'transparent', border: '4px dashed #21252977' } : {}}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label="코트 추가"
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            {/* 레트로 모드 타이틀 */}
            {theme === 'retro' && <h3 className="title" style={{ color: '#21252988' }}>＋</h3>}

            {/* 중앙 추가 아이콘만 */}
            <div className={styles.addIcon}>
                <span className={styles.plusSign}>＋</span>
                <span className={styles.addLabel}>
                    {theme === 'retro' ? 'ADD COURT' : '코트 추가'}
                </span>
            </div>
        </div>
    );
}
