import { useState, useEffect } from 'react';
import styles from './PlayerMagnet.module.css';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CircleMinus, Trash2, LayoutGrid } from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';

interface PlayerMagnetProps {
    id: string; // 고유 ID
    name: string; // 선수 이름 (예: 김배민)
    tier: 'A' | 'B' | 'C' | 'D' | 'E'; // 급수
    matchCount?: number; // 매칭(경기) 횟수
    onSelect?: (id: string) => void; // 선택 핸들러
    isSelected?: boolean; // 선택 여부
    onDelete?: (id: string) => void;
    isEditMode?: boolean; // 삭제 모드 활성화 여부
    waitingStartTime?: number | null;
}

export default function PlayerMagnet({ id, name, tier, matchCount = 0, onSelect, isSelected, onDelete, isEditMode, waitingStartTime }: PlayerMagnetProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { courts, movePlayer, activePopoverPlayerId, setActivePopoverPlayerId } = useBoardStore();
    const [elapsedTime, setElapsedTime] = useState(0);
    const isPopoverOpen = activePopoverPlayerId === id;

    useEffect(() => {
        if (!waitingStartTime) {
            setElapsedTime(0);
            return;
        }

        const updateElapsed = () => {
            const now = Date.now();
            const diff = Math.floor((now - waitingStartTime) / 60000);
            setElapsedTime(diff);
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 60000); // 1분마다 갱신
        return () => clearInterval(interval);
    }, [waitingStartTime]);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    // 드래그 중일 때의 스타일 
    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        opacity: isDragging ? 0.6 : 1, // 원래 있던 자리의 잔상은 낮게 유지
        zIndex: isDragging ? 999 : (isPopoverOpen ? 100 : 1),
        // 드래그 중일 때 약간 커지며 그림자 추가 
        ...(isDragging ? { transform: `${CSS.Translate.toString(transform)} scale(1.05)`, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' } : {})
    };

    // 급수에 따른 동적 클래스네임 할당 (CSS Module 활용)
    const tierClass =
        tier === 'A' ? styles.tierA :
            tier === 'B' ? styles.tierB :
                tier === 'C' ? styles.tierC :
                    tier === 'D' ? styles.tierD :
                        styles.tierE;

    const nesBadgeColor =
        tier === 'A' ? 'is-error' :
            tier === 'B' ? 'is-primary' :
                tier === 'C' ? 'is-warning' :
                    tier === 'D' ? 'is-success' : 'is-dark';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(!isEditMode ? attributes : {})}
            {...(!isEditMode ? listeners : {})}
            className={`${styles.magnetWrapper} ${theme === 'retro' ? 'nes-container is-rounded' : tierClass} ${isEditMode ? styles.editMode : ''} ${isDragging ? styles.dragging : ''} ${isSelected ? styles.selected : ''}`}
            onClick={(e) => {
                if (isEditMode && onDelete) {
                    e.stopPropagation();
                    onDelete(id);
                } else if (!isDragging && (e.ctrlKey || e.metaKey) && onSelect) {
                    e.stopPropagation();
                    onSelect(id);
                }
            }}
        >
            {/* 코트 선택 팝오버 */}
            {isPopoverOpen && !isDragging && (
                <div className={styles.courtPopover} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.popoverHeader}>
                        <span>{theme === 'retro' ? 'SELECT' : '코트 선택'}</span>
                        <button className={styles.popoverClose} onClick={() => setActivePopoverPlayerId(null)}>×</button>
                    </div>
                    <div className={styles.courtButtons}>
                        {courts.map((court) => (
                            <button
                                key={court.id}
                                className={theme === 'retro' ? `nes-btn ${court.players.length >= 4 ? 'is-disabled' : 'is-primary'}` : `${styles.courtBtn} ${court.players.length >= 4 ? styles.disabled : ''}`}
                                onClick={() => {
                                    if (court.players.length < 4) {
                                        movePlayer(id, court.id);
                                        setActivePopoverPlayerId(null);
                                    }
                                }}
                                disabled={court.players.length >= 4}
                            >
                                {court.id}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {isEditMode && (
                <div className={styles.deleteIconOverlay} title="삭제">
                    <CircleMinus size={20} color={theme === 'retro' ? '#212529' : '#ef4444'} fill="white" />
                </div>
            )}
            {theme === 'retro' ? (
                <div className={styles.retroContainer}>
                    <div className={`${styles.retroTop} ${tier === 'A' ? styles.retroTierA :
                        tier === 'B' ? styles.retroTierB :
                            tier === 'C' ? styles.retroTierC :
                                tier === 'D' ? styles.retroTierD : styles.retroTierE
                        }`}
                        onClick={(e) => {
                            if (!isDragging && !isEditMode) {
                                e.stopPropagation();
                                setActivePopoverPlayerId(isPopoverOpen ? null : id);
                            }
                        }}
                    >
                        {tier}
                    </div>
                    <div className={styles.retroBottom}>
                        <span className={styles.retroName}>{name}</span>
                        {waitingStartTime && <span className={styles.retroWaiting}>{t.waitingTime(elapsedTime)}</span>}
                        <span className={styles.retroMatchCount}>{matchCount}</span>
                    </div>
                </div>
            ) : (
                <>
                    <div 
                        className={styles.magnetTop}
                        onClick={(e) => {
                            if (!isDragging && !isEditMode) {
                                e.stopPropagation();
                                setActivePopoverPlayerId(isPopoverOpen ? null : id);
                            }
                        }}
                    >
                        <span className={styles.tierBadge}>{tier}</span>
                    </div>
                    <div className={styles.magnetBottom}>
                        <span className={styles.playerName}>{name}</span>
                        {waitingStartTime && <span className={styles.waitingBadge}>{t.waitingTime(elapsedTime)}</span>}
                        <span className={styles.matchCountBadge}>{matchCount}</span>
                    </div>
                </>
            )}
        </div>
    );
}
