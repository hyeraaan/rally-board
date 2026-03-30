'use client';

import React from 'react';
import styles from './SettingsModal.module.css';
import { useBoardStore } from '@/store/useBoardStore';
import { useLanguage } from '@/providers/LanguageProvider';
import { X, Settings, AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
    const { t } = useLanguage();
    const resetAll = useBoardStore(state => state.resetAll);

    const handleReset = () => {
        if (window.confirm(t.resetConfirmMsg)) {
            resetAll();
            onClose();
            alert(t.resetSuccessMsg);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalCard}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <Settings size={20} />
                        {t.settingsTitle}
                    </h2>
                    <button
                        type="button"
                        className={styles.modalCloseBtn}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.dangerZone}>
                        <h3 className={styles.dangerTitle}>
                            <AlertTriangle size={20} />
                            {t.dangerZoneTitle}
                        </h3>
                        
                        <p className={styles.dangerDesc}>
                            {t.dangerZoneDesc}
                        </p>
                        
                        <button
                            type="button"
                            className={styles.resetBtn}
                            onClick={handleReset}
                        >
                            <RotateCcw size={18} />
                            {t.resetAllBtn}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
