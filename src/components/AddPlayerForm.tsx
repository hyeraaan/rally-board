'use client';

import { useState } from 'react';
import styles from './AddPlayerForm.module.css';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { Plus, Minus, Check, X } from 'lucide-react';
import { useBoardStore, Tier } from '@/store/useBoardStore';

const TIERS: Tier[] = ['A', 'B', 'C', 'D', 'E'];

export default function AddPlayerForm() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { addPlayer, clearWaitingList, addPlayersBulk, openConfirm } = useBoardStore();
    const [open, setOpen] = useState(false);
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
        setOpen(false);
    };

    const handleClearAll = () => {
        openConfirm(
            theme === 'retro' ? 'CLEAR ALL?' : '모든 대기 명단을 삭제하시겠습니까?',
            () => clearWaitingList()
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') setOpen(false);
    };

    if (!open) {
        return (
            <div className={styles.addBtnGroup}>
                <button
                    type="button"
                    className={theme === 'retro' ? `nes-btn ${styles.addBtnRetro}` : styles.addBtn}
                    onClick={() => setOpen(true)}
                    aria-label={t.addPlayerTooltip}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Plus size={theme === 'retro' ? 32 : 24} />
                </button>
                <button
                    type="button"
                    className={theme === 'retro' ? `nes-btn is-error ${styles.clearBtnRetro}` : styles.clearBtn}
                    onClick={handleClearAll}
                    title="전체 명단 삭제"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Minus size={theme === 'retro' ? 32 : 24} />
                </button>
            </div>
        );
    }

    return (
        <div className={`${styles.formWrapper} ${theme === 'retro' ? styles.retro : ''}`}>
            <input
                type="text"
                className={theme === 'retro' ? `nes-input ${styles.nameInputRetro}` : styles.nameInput}
                placeholder={theme === 'retro' ? 'e.g. A John, B Doe' : '예: a 정혜란, b 홍길동'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                maxLength={200} // 대량 입력을 위해 최대 길이 증가
            />
            {/* 콤마가 없을 때만 급수 선택 표시 (UX 간소화) */}
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
                    title={theme === 'retro' ? 'OK' : t.addBtn}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                    <Check size={theme === 'retro' ? 20 : 16} /> {name.includes(',') ? 'Bulk Add' : t.addBtn}
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
