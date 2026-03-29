'use client';

import { useState } from 'react';
import styles from './AddPlayerForm.module.css';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { Check, X } from 'lucide-react';
import { useBoardStore, Tier } from '@/store/useBoardStore';

const TIERS: Tier[] = ['A', 'B', 'C', 'D', 'E'];

export default function AddPlayerForm({ onClose }: { onClose: () => void }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { addPlayer, clearWaitingList, addPlayersBulk } = useBoardStore();
    const [name, setName] = useState('');
    const [tier, setTier] = useState<Tier>('C');

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;

        // 콤마가 포함되어 있거나, 급수 패턴(a 이름)으로 시작하는 경우 대량 추가 시도
        if (trimmed.includes(',') || /^([a-eA-E])\s*(.+)/.test(trimmed)) {
            addPlayersBulk(trimmed);
        } else {
            // 단일 추가
            addPlayer(trimmed, tier);
        }
        
        setName('');
        setTier('C');
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={`${styles.modalCard} ${theme === 'retro' ? styles.retro : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>
                        {theme === 'retro' ? `+ ${t.addPlayerTitle.toUpperCase()}` : t.addPlayerTitle}
                    </span>
                    <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <input
                    type="text"
                    className={theme === 'retro' ? `nes-input ${styles.nameInputRetro}` : styles.nameInput}
                    placeholder={t.bulkAddPlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    maxLength={200}
                />
                {!name.includes(',') && (
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
                )}
                <div className={styles.actionRow}>
                    <button
                        type="button"
                        className={`${theme === 'retro' ? `nes-btn is-success ${styles.btnRetro} ${styles.confirmRetro}` : styles.confirmBtn}`}
                        onClick={handleSubmit}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                        <Check size={theme === 'retro' ? 20 : 16} /> {name.includes(',') ? t.bulkAddBtnText : t.addBtn}
                    </button>
                    <button
                        type="button"
                        className={`${theme === 'retro' ? `nes-btn ${styles.btnRetro}` : styles.cancelBtn}`}
                        onClick={onClose}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                        <X size={theme === 'retro' ? 20 : 16} /> {t.cancelBtn}
                    </button>
                </div>
            </div>
        </div>
    );
}
