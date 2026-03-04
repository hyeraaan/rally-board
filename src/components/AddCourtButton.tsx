'use client';

import styles from './AddCourtButton.module.css';
import { useTheme } from '@/providers/ThemeProvider';
import { Plus } from 'lucide-react';

interface AddCourtButtonProps {
    onClick: () => void;
}

export default function AddCourtButton({ onClick }: AddCourtButtonProps) {
    const { theme } = useTheme();

    return (
        <button
            type="button"
            className={
                theme === 'retro'
                    ? `nes-btn ${styles.retroAddCourtWrapper}`
                    : styles.addCourtWrapper
            }
            onClick={onClick}
            aria-label="코트 추가"
        >
            <div className={styles.addIcon}>
                <span className={styles.plusSign}>
                    <Plus size={theme === 'retro' ? 36 : 28} />
                </span>
                <span className={styles.addLabel}>
                    코트 추가
                </span>
            </div>
        </button>
    );
}
