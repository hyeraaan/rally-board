'use client';

import { useState } from 'react';
import styles from './AddPlayerForm.module.css';
import { useTheme } from '@/providers/ThemeProvider';

type Tier = 'A' | 'B' | 'C' | 'D' | 'E';

interface AddPlayerFormProps {
    onAdd: (name: string, tier: Tier) => void;
}

const TIERS: Tier[] = ['A', 'B', 'C', 'D', 'E'];

export default function AddPlayerForm({ onAdd }: AddPlayerFormProps) {
    const { theme } = useTheme();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [tier, setTier] = useState<Tier>('C');

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        onAdd(trimmed, tier);
        setName('');
        setTier('C');
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') setOpen(false);
    };

    if (!open) {
        return (
            <button
                type="button"
                className={theme === 'retro' ? `nes-btn ${styles.addBtnRetro}` : styles.addBtn}
                onClick={() => setOpen(true)}
                aria-label="선수 추가"
            >
                ＋
            </button>
        );
    }

    return (
        <div className={`${styles.formWrapper} ${theme === 'retro' ? styles.retro : ''}`}>
            <input
                type="text"
                className={theme === 'retro' ? `nes-input ${styles.nameInputRetro}` : styles.nameInput}
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                maxLength={10}
            />
            <div className={styles.tierRow}>
                {TIERS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        className={`${styles.tierBtn} ${styles[`tier${t}`]} ${tier === t ? styles.selected : ''} ${theme === 'retro' ? styles.tierBtnRetro : ''}`}
                        onClick={() => setTier(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>
            <div className={styles.actionRow}>
                <button
                    type="button"
                    className={`${theme === 'retro' ? `nes-btn is-success ${styles.btnRetro} ${styles.confirmRetro}` : styles.confirmBtn}`}
                    onClick={handleSubmit}
                    title={theme === 'retro' ? 'OK' : '추가'}
                >
                    {theme === 'retro' ? 'O' : '추가'}
                </button>
                <button
                    type="button"
                    className={`${theme === 'retro' ? `nes-btn ${styles.btnRetro}` : styles.cancelBtn}`}
                    onClick={() => setOpen(false)}
                    title={theme === 'retro' ? 'X' : '취소'}
                >
                    {theme === 'retro' ? 'X' : '취소'}
                </button>
            </div>
        </div>
    );
}
