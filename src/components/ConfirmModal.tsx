'use client';

import React from 'react';
import { useBoardStore } from '@/store/useBoardStore';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import styles from './ConfirmModal.module.css';

export default function ConfirmModal() {
    const { confirmModal, closeConfirm } = useBoardStore();
    const { theme } = useTheme();
    const { t } = useLanguage();

    if (!confirmModal || !confirmModal.isOpen) return null;

    const handleConfirm = () => {
        confirmModal.onConfirm();
        closeConfirm();
    };

    return (
        <div className={styles.modalOverlay} onClick={closeConfirm}>
            <div
                className={`${styles.modalContent} ${theme === 'retro'
                        ? `nes-dialog is-rounded ${styles.retroContent}`
                        : styles.classicContent
                    }`}
                onClick={(e) => e.stopPropagation()}
                style={theme === 'retro' ? { border: '4px solid #000' } : {}}
            >
                {theme === 'retro' ? (
                    <form method="dialog">
                        <p className={styles.retroMessage}>
                            {confirmModal.message}
                        </p>
                        <menu className={styles.retroButtons}>
                            <button className="nes-btn" onClick={closeConfirm}>{t.cancelModalBtn}</button>
                            <button className="nes-btn is-primary" onClick={handleConfirm}>{t.confirmBtn}</button>
                        </menu>
                    </form>
                ) : (
                    <>
                        <p className={styles.message}>
                            {confirmModal.message}
                        </p>
                        <div className={styles.buttonGroup}>
                            <button className={styles.classicCancelBtn} onClick={closeConfirm}>
                                {t.cancelModalBtn}
                            </button>
                            <button className={styles.classicConfirmBtn} onClick={handleConfirm}>
                                {t.confirmBtn}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
