import { useState, useEffect } from 'react';
import styles from './BadmintonCourt.module.css';
import PlayerMagnet from './PlayerMagnet';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Play, Square, Trash2, Timer } from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';

interface BadmintonCourtProps {
    courtNumber: number;
    players: { id: string; name: string; tier: any; matchCount: number }[];
    status?: 'waiting' | 'playing';
    startTime?: number;
    onDelete?: (id: number) => void;
    onDeletePlayer?: (playerId: string) => void;
    isEditMode?: boolean;
}

export default function BadmintonCourt({ courtNumber, players, status = 'waiting', startTime, onDelete, onDeletePlayer, isEditMode }: BadmintonCourtProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { startGame, endGame, openConfirm } = useBoardStore();

    const [elapsedTime, setElapsedTime] = useState(0);

    // 타이머 로직
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (status === 'playing' && startTime) {
            const calculateElapsed = () => {
                const now = Date.now();
                const diff = Math.floor((now - startTime) / 1000);
                setElapsedTime(diff);
            };

            calculateElapsed();
            interval = setInterval(calculateElapsed, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => clearInterval(interval);
    }, [status, startTime]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const { setNodeRef, isOver } = useDroppable({
        id: courtNumber,
        data: {
            type: 'Court',
            courtId: courtNumber
        },
        disabled: players.length >= 4 || status === 'playing', // 게임 중이면 더 이상 드롭 불가
    });

    return (
        <div
            ref={setNodeRef}
            className={`${styles.courtWrapper} ${theme === 'retro' ? 'nes-container with-title' : ''}`}
            style={{
                ...(theme === 'retro' ? { padding: '1.5rem', backgroundColor: 'transparent', border: '4px solid #212529', position: 'relative' } : { position: 'relative' }),
                boxShadow: isOver
                    ? (theme === 'retro' ? '0 0 0 6px #f59e0b' : '0 0 0 4px #3b82f6, 0 8px 24px rgba(59, 130, 246, 0.4)')
                    : undefined,
                transform: isOver ? 'scale(1.01)' : 'scale(1)',
                transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
                zIndex: isOver ? 10 : 1,
            }}
        >
            {theme === 'retro' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="title" style={{ display: 'inline-block', backgroundColor: 'white', marginBottom: '8px' }}>
                        {courtNumber} ({players.length}/4)
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        {status === 'waiting' && players.length === 4 && (
                            <button
                                className="nes-btn is-success"
                                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                onClick={() => startGame(courtNumber)}
                            >
                                {t.startGame15m}
                            </button>
                        )}
                        {status === 'playing' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Timer size={18} /> {formatTime(elapsedTime)}
                                </span>
                                <button
                                    className="nes-btn is-warning"
                                    style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                    onClick={() => {
                                        openConfirm(t.endGameConfirm, () => endGame(courtNumber));
                                    }}
                                    title={t.endGameRetroTitle}
                                >
                                    {t.endGame}
                                </button>
                            </div>
                        )}
                        {onDelete && (
                            <button
                                className="nes-btn is-error"
                                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                onClick={() => onDelete(courtNumber)}
                            >
                                X
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.courtHeader} style={{ marginBottom: '12px' }}>
                    <h3>{courtNumber}</h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {status === 'waiting' ? (
                            players.length === 4 ? (
                                <button
                                    onClick={() => startGame(courtNumber)}
                                    style={{
                                        backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px',
                                        padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    <Play size={14} /> {t.startGame}
                                </button>
                            ) : (
                                <span className={styles.playerCount}>{t.playerCount(players.length, 4)}</span>
                            )
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px' }}>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Timer size={14} /> {formatTime(elapsedTime)}
                                </span>
                                <button
                                    onClick={() => {
                                        openConfirm(t.endGameConfirm, () => endGame(courtNumber));
                                    }}
                                    style={{
                                        backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px',
                                        padding: '2px 8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem'
                                    }}
                                    title={t.endGameEarlyTitle}
                                >
                                    {t.endGame}
                                </button>
                            </div>
                        )}

                        {onDelete && (
                            <button
                                onClick={() => onDelete(courtNumber)}
                                className={styles.deleteBtn}
                                title="코트 삭제"
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.courtField}>
                <div className={styles.courtLines}>
                    <div className={styles.centerLine}></div>
                    <div className={styles.serviceLineTop}></div>
                    <div className={styles.serviceLineBottom}></div>
                </div>

                <div className={styles.playersContainer}>
                    <SortableContext items={players.map((p) => p.id)} strategy={rectSortingStrategy}>
                        {players.map((player) => (
                            <PlayerMagnet
                                key={player.id}
                                id={player.id}
                                name={player.name}
                                tier={player.tier}
                                matchCount={player.matchCount}
                                onDelete={onDeletePlayer}
                                isEditMode={isEditMode}
                            />
                        ))}
                    </SortableContext>

                    {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, idx) => (
                        <div
                            key={`empty-${idx}`}
                            className={`${styles.emptySlot} ${theme === 'retro' ? 'nes-container is-rounded' : ''}`}
                        >
                            <div className={styles.emptyTop}>-</div>
                            <div className={styles.emptyBottom}>
                                <span className={theme === 'retro' ? styles.retroEmptyName : ''}>{t.waiting}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
