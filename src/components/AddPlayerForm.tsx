'use client';

import { useState } from 'react';
import styles from './AddPlayerForm.module.css';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { Plus, Check, X } from 'lucide-react';

type Tier = 'A' | 'B' | 'C' | 'D' | 'E';

interface AddPlayerFormProps {
    onAdd: (name: string, tier: Tier) => void;
}

const TIERS: Tier[] = ['A', 'B', 'C', 'D', 'E'];

export default function AddPlayerForm({ onAdd }: AddPlayerFormProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
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
                aria-label={t.addPlayerTooltip}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Plus size={theme === 'retro' ? 32 : 24} />
            </button>
        );
    }

    return (
        <div className={`${styles.formWrapper} ${theme === 'retro' ? styles.retro : ''}`}>
            <input
                type="text"
                className={theme === 'retro' ? `nes-input ${styles.nameInputRetro}` : styles.nameInput}
                placeholder={t.playerNamePlaceholder}
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
                    title={theme === 'retro' ? 'OK' : t.addBtn}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                    <Check size={theme === 'retro' ? 20 : 16} /> {t.addBtn}
                </button>
                <button
                    type="button"
                    className={`${theme === 'retro' ? `nes-btn ${styles.btnRetro}` : styles.cancelBtn}`}
                    onClick={() => setOpen(false)}
                    title={theme === 'retro' ? 'X' : t.cancelBtn}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                    <X size={theme === 'retro' ? 20 : 16} /> {t.cancelBtn}
                </button>
            </div>
        </div>
    );
}
