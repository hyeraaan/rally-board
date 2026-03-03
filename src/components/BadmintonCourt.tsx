import styles from './BadmintonCourt.module.css';
import PlayerMagnet from './PlayerMagnet';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';

interface BadmintonCourtProps {
    courtNumber: number;
    players: { id: string; name: string; tier: any }[];
}

export default function BadmintonCourt({ courtNumber, players }: BadmintonCourtProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <div className={`${styles.courtWrapper} ${theme === 'retro' ? 'nes-container with-title' : ''}`} style={theme === 'retro' ? { padding: '1.5rem', backgroundColor: 'transparent', border: '4px solid #212529' } : {}}>
            {theme === 'retro' ? (
                <h3 className="title">{courtNumber} ({players.length}/4)</h3>
            ) : (
                <div className={styles.courtHeader}>
                    <h3>{courtNumber}</h3>
                    <span className={styles.playerCount}>{players.length} / 4 명</span>
                </div>
            )}

            <div className={styles.courtField}>
                <div className={styles.courtLines}>
                    <div className={styles.centerLine}></div>
                    <div className={styles.serviceLineTop}></div>
                    <div className={styles.serviceLineBottom}></div>
                </div>

                <div className={styles.playersContainer}>
                    {players.map((player) => (
                        <PlayerMagnet
                            key={player.id}
                            id={player.id}
                            name={player.name}
                            tier={player.tier}
                        />
                    ))}

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
