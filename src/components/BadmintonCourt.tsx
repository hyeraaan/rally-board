import styles from './BadmintonCourt.module.css';
import PlayerMagnet from './PlayerMagnet';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface BadmintonCourtProps {
    courtNumber: number;
    players: { id: string; name: string; tier: any }[];
    onDelete?: (id: number) => void;
    onDeletePlayer?: (playerId: string) => void;
    isEditMode?: boolean;
}

export default function BadmintonCourt({ courtNumber, players, onDelete, onDeletePlayer, isEditMode }: BadmintonCourtProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const { setNodeRef, isOver } = useDroppable({
        id: courtNumber,
        data: {
            type: 'Court',
            courtId: courtNumber
        },
        disabled: players.length >= 4,
    });

    return (
        <div
            ref={setNodeRef}
            className={`${styles.courtWrapper} ${theme === 'retro' ? 'nes-container with-title' : ''}`}
            style={{
                ...(theme === 'retro' ? { padding: '1.5rem', backgroundColor: 'transparent', border: '4px solid #212529', position: 'relative' } : { position: 'relative' }),
                boxShadow: isOver ? '0 0 0 4px #3b82f6' : undefined,
                transition: 'box-shadow 0.2s ease',
            }}
        >
            {theme === 'retro' ? (
                <>
                    <h3 className="title" style={{ display: 'inline-block', backgroundColor: 'white' }}>{courtNumber} ({players.length}/4)</h3>
                    {onDelete && (
                        <button
                            className="nes-btn is-error"
                            style={{ position: 'absolute', top: '-15px', right: '10px', padding: '0 8px', fontSize: '0.8rem' }}
                            onClick={() => onDelete(courtNumber)}
                        >
                            X
                        </button>
                    )}
                </>
            ) : (
                <div className={styles.courtHeader}>
                    <h3>{courtNumber}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={styles.playerCount}>{players.length} / 4 명</span>
                        {onDelete && (
                            <button
                                onClick={() => onDelete(courtNumber)}
                                className={styles.deleteBtn}
                                title="코트 삭제"
                            >
                                🗑️
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
