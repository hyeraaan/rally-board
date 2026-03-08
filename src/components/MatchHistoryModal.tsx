import React from 'react';
import { useBoardStore } from '@/store/useBoardStore';
import { useTheme } from '@/providers/ThemeProvider';
import styles from './MatchHistoryModal.module.css';

interface MatchHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MatchHistoryModal({ isOpen, onClose }: MatchHistoryModalProps) {
    const { matchHistory } = useBoardStore();
    const { theme } = useTheme();

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={`${styles.modalContent} ${theme === 'retro' ? 'nes-dialog is-rounded' : ''}`}
                style={theme === 'retro' ? { padding: '1.5rem', border: '4px solid #000', backgroundColor: '#fff' } : {}}
                onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
            >
                {theme === 'retro' ? (
                    <div className="title" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 'bold' }}>📜 매칭 기록</span>
                        <button className="nes-btn is-error" style={{ padding: '0 8px' }} onClick={onClose}>X</button>
                    </div>
                ) : (
                    <div className={styles.modalHeader}>
                        <h2>📜 매칭 기록</h2>
                        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                    </div>
                )}

                <div className={styles.historyList}>
                    {matchHistory.length === 0 ? (
                        <div className={styles.emptyMessage}>
                            오늘 진행된 매칭이 없습니다.
                        </div>
                    ) : (
                        matchHistory.map((record) => (
                            <div key={record.id} className={`${styles.historyItem} ${theme === 'retro' ? 'nes-container is-rounded' : ''}`} style={theme === 'retro' ? { padding: '1rem', marginBottom: '1rem' } : {}}>
                                <div className={styles.itemHeader}>
                                    <span className={styles.courtBadge}>코트 {record.courtId}</span>
                                    <span className={styles.timeBadge}>{record.startTimeStr}</span>
                                </div>
                                <div className={styles.playerGrid}>
                                    {record.players.map((p) => (
                                        <div key={p.id} className={`${styles.playerTag} ${theme === 'retro' ? styles.retroTag : ''}`}>
                                            <span className={styles.tierBadge} data-tier={p.tier}>{p.tier}</span>
                                            <span className={styles.playerName}>{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
