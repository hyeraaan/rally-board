import styles from './PlayerMagnet.module.css';
import { useTheme } from '@/providers/ThemeProvider';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlayerMagnetProps {
    id: string; // 고유 ID
    name: string; // 선수 이름 (예: 김배민)
    tier: 'A' | 'B' | 'C' | 'D' | 'E'; // 급수
    onDelete?: (id: string) => void;
    isEditMode?: boolean; // 삭제 모드 활성화 여부
}

export default function PlayerMagnet({ id, name, tier, onDelete, isEditMode }: PlayerMagnetProps) {
    const { theme } = useTheme();
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
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : 1,
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
            className={`${styles.magnetWrapper} ${theme === 'retro' ? 'nes-container is-rounded' : tierClass} ${isEditMode ? styles.editMode : ''} ${isDragging ? styles.dragging : ''}`}
            onClick={(e) => {
                if (isEditMode && onDelete) {
                    e.stopPropagation();
                    onDelete(id);
                }
            }}
        >
            {theme === 'retro' ? (
                <div className={styles.retroContainer}>
                    <div className={`${styles.retroTop} ${tier === 'A' ? styles.retroTierA :
                        tier === 'B' ? styles.retroTierB :
                            tier === 'C' ? styles.retroTierC :
                                tier === 'D' ? styles.retroTierD : styles.retroTierE
                        }`}>
                        {tier}
                    </div>
                    <div className={styles.retroBottom}>
                        <span className={styles.retroName}>{name}</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.magnetTop}>
                        <span className={styles.tierBadge}>{tier}</span>
                    </div>
                    <div className={styles.magnetBottom}>
                        <span className={styles.playerName}>{name}</span>
                    </div>
                </>
            )}
        </div>
    );
}
