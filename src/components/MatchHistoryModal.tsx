'use client';

import React from 'react';
import { useBoardStore } from '@/store/useBoardStore';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { X, History } from 'lucide-react';
import styles from './MatchHistoryModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchHistoryModal({ isOpen, onClose }: Props) {
  const { matchHistory } = useBoardStore();
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalCard} ${theme === 'retro' ? styles.retro : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <History size={20} color={theme === 'retro' ? "#212529" : "currentColor"} />
            {t.historyTitle}
          </h2>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.historyList}>
          {matchHistory.length === 0 ? (
            <div className={styles.emptyMessage}>{t.noHistory}</div>
          ) : (
            matchHistory.map((record) => (
              <div key={record.id} className={styles.historyItem}>
                <div className={styles.itemHeader}>
                  <span className={styles.courtBadge}>{theme === 'retro' ? `MATCH ${record.courtId}` : `Match ${record.courtId}`}</span>
                  <span className={styles.timeBadge}>{record.startTimeStr}</span>
                </div>
                <div className={styles.playerGrid}>
                  {record.players.map((player) => (
                    <div key={player.id} className={styles.playerTag}>
                      <span className={styles.tierBadge} data-tier={player.tier}>
                        {player.tier}
                      </span>
                      <span className={styles.playerName}>{player.name}</span>
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
