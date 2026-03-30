'use client';

import React from 'react';
import { useBoardStore } from '@/store/useBoardStore';
import { useLanguage } from '@/providers/LanguageProvider';
import { X, AlertCircle } from 'lucide-react';
import styles from './ConfirmModal.module.css';

export default function ConfirmModal() {
    const { confirmModal, closeConfirm } = useBoardStore();
    const { t } = useLanguage();

    if (!confirmModal || !confirmModal.isOpen) return null;

    const handleConfirm = () => {
        confirmModal.onConfirm();
        closeConfirm();
    };

    return (
        <div className={styles.modalOverlay} onClick={closeConfirm}>
            <div
                className={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <AlertCircle size={20} color="#f59e0b" />
                        {t.confirmTitle}
                    </h2>
                    <button type="button" className={styles.modalCloseBtn} onClick={closeConfirm}>
                        <X size={18} />
                    </button>
                </div>
                
                <p className={styles.alertMessage}>
                    {confirmModal.message}
                </p>
                
                <div className={styles.actionRow}>
                    <button className={styles.cancelBtn} onClick={closeConfirm}>
                        {t.cancelModalBtn}
                    </button>
                    <button className={styles.confirmBtn} onClick={handleConfirm}>
                        {t.confirmBtn}
                    </button>
                </div>
            </div>
        </div>
    );
}
