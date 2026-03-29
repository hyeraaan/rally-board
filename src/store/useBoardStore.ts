import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Tier = 'A' | 'B' | 'C' | 'D' | 'E';
// ... (기존 인터페이스 유지)
export interface Player {
    id: string;
    name: string;
    tier: Tier;
    matchCount: number;
    waitingStartTime?: number | null;
}

export interface Court {
    id: number;
    players: Player[];
    status: 'waiting' | 'playing';
    startTime?: number;
}

export interface MatchRecord {
    id: string;
    courtId: number;
    players: Player[];
    startTimeStr: string;
}

interface BoardState {
    courts: Court[];
    waitingList: Player[];
    matchHistory: MatchRecord[];
    isEditMode: boolean;
    isCountingDown: boolean;
    countdownTime: number;
    isEventRunning: boolean;
    eventStartTime: number | null;
    confirmModal: {
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    } | null;
    activePopoverPlayerId: string | null;
    lastUpdated: number; // 마지막 업데이트 시간 (일주일 유지 체크용)
    tournamentTitle: string; // 대회 타이틀
    isInitialized: boolean; // 초기 데이터 생성 여부 (리셋 후 재생성 방지)
    setActivePopoverPlayerId: (id: string | null) => void;
    setTournamentTitle: (title: string) => void;

    // Actions
// ...
    setCourts: (courts: Court[]) => void;
    setWaitingList: (waitingList: Player[]) => void;
    toggleEditMode: () => void;

    // Specific Actions
    addCourt: () => void;
    deleteCourt: (courtId: number) => void;
    addPlayer: (name: string, tier: Tier) => void;
    deletePlayer: (playerId: string) => void;
    movePlayer: (playerId: string, toId: string | number) => void;
    moveMultiplePlayers: (playerIds: string[], targetCourtId: number) => void;
    startGame: (courtId: number) => void;
    endGame: (courtId: number) => void;
    randomMatch: () => void;
    setIsCountingDown: (isCounting: boolean) => void;
    setCountdownTime: (time: number) => void;
    startAllReadyGames: () => void;
    endAllGames: () => void;
    startTournament: () => void;
    endTournament: () => void;
    openConfirm: (message: string, onConfirm: () => void) => void;
    closeConfirm: () => void;
    clearWaitingList: () => void;
    addPlayersBulk: (input: string) => void;
    initializeData: () => void;
    resetAll: () => void;
}

const CELEBRITY_POOL: { name: string; tier: Tier }[] = [
    // A급 (최상급자)
    { name: '변우석', tier: 'A' }, { name: '김혜윤', tier: 'A' }, { name: '민지', tier: 'A' },
    { name: '하니', tier: 'A' }, { name: '장원영', tier: 'A' }, { name: '카리나', tier: 'A' },
    { name: '공유', tier: 'A' }, { name: '차은우', tier: 'A' }, { name: '뷔', tier: 'A' },
    { name: '정국', tier: 'A' }, { name: '성찬', tier: 'A' }, { name: '태용', tier: 'A' },

    // B급 (상급자)
    { name: '해린', tier: 'B' }, { name: '안유진', tier: 'B' }, { name: '윈터', tier: 'B' },
    { name: '손석구', tier: 'B' }, { name: '박보검', tier: 'B' }, { name: '송강', tier: 'B' },
    { name: '로운', tier: 'B' }, { name: '이도현', tier: 'B' }, { name: '김고은', tier: 'B' },
    { name: '지민', tier: 'B' }, { name: '원빈', tier: 'B' }, { name: '제니', tier: 'B' },

    // C급 (중급자)
    { name: '다니엘', tier: 'C' }, { name: '혜인', tier: 'C' }, { name: '김채원', tier: 'C' },
    { name: '가을', tier: 'C' }, { name: '레이', tier: 'C' }, { name: '닝닝', tier: 'C' },
    { name: '한소희', tier: 'C' }, { name: '고윤정', tier: 'C' }, { name: '안효섭', tier: 'C' },
    { name: '남주혁', tier: 'C' }, { name: '서강준', tier: 'C' }, { name: '신세경', tier: 'C' },

    // D급 (초중급자)
    { name: '리즈', tier: 'D' }, { name: '이서', tier: 'D' }, { name: '지젤', tier: 'D' },
    { name: '홍은채', tier: 'D' }, { name: '사쿠라', tier: 'D' }, { name: '허윤진', tier: 'D' },
    { name: '노윤서', tier: 'D' }, { name: '최현욱', tier: 'D' }, { name: '김영대', tier: 'D' },
    { name: '이재욱', tier: 'D' }, { name: '박규영', tier: 'D' }, { name: '설인아', tier: 'D' },

    // E급 (입문자)
    { name: '김유정', tier: 'E' }, { name: '조이현', tier: 'E' }, { name: '남윤수', tier: 'E' },
    { name: '전배수', tier: 'E' }, { name: '김선호', tier: 'E' }, { name: '박은빈', tier: 'E' },
    { name: '문가영', tier: 'E' }, { name: '김지원', tier: 'E' }, { name: '설윤', tier: 'E' },
    { name: '해원', tier: 'E' }, { name: '백현', tier: 'E' }, { name: '승관', tier: 'E' },
];

const getRandomInitialWaitingList = (): Player[] => {
    const getByTier = (tier: Tier, count: number) => {
        const filtered = CELEBRITY_POOL.filter(p => p.tier === tier);
        return [...filtered].sort(() => 0.5 - Math.random()).slice(0, count);
    };

    // 요청하신 비율: A:2, B:2, C:2, D:5, E:9 (총 20명)
    const selected = [
        ...getByTier('A', 2),
        ...getByTier('B', 2),
        ...getByTier('C', 2),
        ...getByTier('D', 5),
        ...getByTier('E', 9),
    ];

    // 전체 리스트를 한 번 더 섞어줍니다.
    const finalShuffled = selected.sort(() => 0.5 - Math.random());

    return finalShuffled.map((celeb, idx) => ({
        id: `w${idx}-${Date.now()}`,
        name: celeb.name,
        tier: celeb.tier,
        matchCount: 0,
        waitingStartTime: null
    }));
};

const initialCourts: Court[] = [
    { id: 1, players: [], status: 'waiting' },
    { id: 2, players: [], status: 'waiting' },
    { id: 3, players: [], status: 'waiting' },
];

const initialWaitingList: Player[] = []; // 클라이언트에서 랜덤으로 채울 예정

export const useBoardStore = create<BoardState>()(
    persist(
        (set, get) => ({
            courts: initialCourts,
            waitingList: initialWaitingList,
            matchHistory: [],
            isEditMode: false,
            isCountingDown: false,
            countdownTime: 3,
            isEventRunning: false,
            eventStartTime: null,
            confirmModal: null,
            tournamentTitle: '랠리보드 배드민턴 대회',
            activePopoverPlayerId: null,
            lastUpdated: Date.now(),
            isInitialized: false,

            setCourts: (courts) => set({ courts, lastUpdated: Date.now() }),
            setActivePopoverPlayerId: (id) => set((state) => ({ ...state, activePopoverPlayerId: id })),
            setTournamentTitle: (title) => set({ tournamentTitle: title, lastUpdated: Date.now() }),
            setWaitingList: (waitingList) => set({ waitingList, lastUpdated: Date.now() }),
            toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

            addCourt: () =>
                set((state) => {
                    const newId = state.courts.length > 0 ? Math.max(...state.courts.map((c) => c.id)) + 1 : 1;
                    return { courts: [...state.courts, { id: newId, players: [], status: 'waiting' }], lastUpdated: Date.now() };
                }),

            deleteCourt: (courtId) =>
                set((state) => {
                    const courtToDelete = state.courts.find((c) => c.id === courtId);
                    if (!courtToDelete) return state;

                    return {
                        waitingList: [...state.waitingList, ...courtToDelete.players.map(p => ({ ...p, waitingStartTime: state.isEventRunning ? Date.now() : null }))],
                        courts: state.courts.filter((c) => c.id !== courtId),
                        lastUpdated: Date.now()
                    };
                }),

            addPlayer: (name, tier) =>
                set((state) => {
                    const newId = `w${Date.now()}`;
                    const newPlayer: Player = {
                        id: newId,
                        name,
                        tier,
                        matchCount: 0,
                        waitingStartTime: state.isEventRunning ? Date.now() : null
                    };
                    return { waitingList: [...state.waitingList, newPlayer], lastUpdated: Date.now() };
                }),

            deletePlayer: (playerId) =>
                set((state) => {
                    let isFromCourt = false;
                    let targetPlayer: Player | undefined;
                    let isModified = false;

                    const newCourts = state.courts.map((court) => {
                        const p = court.players.find((p) => p.id === playerId);
                        if (p) {
                            isFromCourt = true;
                            targetPlayer = p;
                            isModified = true;
                            return { ...court, players: court.players.filter((p) => p.id !== playerId) };
                        }
                        return court;
                    });

                    let newWaitingList = state.waitingList;

                    if (isFromCourt && targetPlayer) {
                        if (!state.waitingList.some((p) => p.id === playerId)) {
                            newWaitingList = [...state.waitingList, targetPlayer];
                        }
                    } else {
                        newWaitingList = state.waitingList.filter((p) => p.id !== playerId);
                    }

                    return {
                        courts: isModified ? newCourts : state.courts,
                        waitingList: newWaitingList,
                        lastUpdated: Date.now()
                    };
                }),

            movePlayer: (playerId, toId) =>
                set((state) => {
                    let targetPlayer: Player | undefined;
                    let fromWaitingList = false;

                    const inWaiting = state.waitingList.find((p) => p.id === playerId);
                    if (inWaiting) {
                        targetPlayer = inWaiting;
                        fromWaitingList = true;
                    }

                    if (!targetPlayer) {
                        for (const court of state.courts) {
                            const inCourt = court.players.find((p) => p.id === playerId);
                            if (inCourt) {
                                targetPlayer = inCourt;
                                break;
                            }
                        }
                    }

                    if (!targetPlayer) return state;

                    let actualToId = toId;
                    let targetIndex = -1;

                    if (typeof toId === 'string' && toId !== 'waiting-list') {
                        const waitingIdx = state.waitingList.findIndex((p) => p.id === toId);
                        if (waitingIdx !== -1) {
                            actualToId = 'waiting-list';
                            targetIndex = waitingIdx;
                        } else {
                            for (const c of state.courts) {
                                const courtIdx = c.players.findIndex((p) => p.id === toId);
                                if (courtIdx !== -1) {
                                    actualToId = c.id;
                                    targetIndex = courtIdx;
                                    break;
                                }
                            }
                        }
                    }

                    if (typeof actualToId === 'number') {
                        const destCourt = state.courts.find((c) => c.id === actualToId);
                        if (destCourt && destCourt.players.length >= 4) {
                            const isAlreadyInDest = destCourt.players.some((p) => p.id === playerId);
                            if (!isAlreadyInDest) return state;
                        }
                    }

                    let newWaitingList = [...state.waitingList];
                    const newCourts = state.courts.map((c) => ({ ...c, players: [...c.players] }));

                    if (fromWaitingList) {
                        newWaitingList = newWaitingList.filter((p) => p.id !== playerId);
                    } else {
                        for (const court of newCourts) {
                            court.players = court.players.filter((p) => p.id !== playerId);
                        }
                    }

                    if (actualToId === 'waiting-list') {
                        const finalPlayer = {
                            ...targetPlayer!,
                            waitingStartTime: (!fromWaitingList && state.isEventRunning) ? Date.now() : targetPlayer!.waitingStartTime
                        };
                        if (targetIndex !== -1) {
                            newWaitingList.splice(targetIndex, 0, finalPlayer);
                        } else {
                            newWaitingList.push(finalPlayer);
                        }
                    } else {
                        const destCourt = newCourts.find((c) => c.id === actualToId);
                        if (destCourt) {
                            const finalPlayer = { ...targetPlayer!, waitingStartTime: null };
                            if (targetIndex !== -1) {
                                destCourt.players.splice(targetIndex, 0, finalPlayer);
                            } else {
                                destCourt.players.push(finalPlayer);
                            }
                        }
                    }

                    return {
                        courts: newCourts,
                        waitingList: newWaitingList,
                        lastUpdated: Date.now()
                    };
                }),

            moveMultiplePlayers: (playerIds, targetCourtId) =>
                set((state) => {
                    const targetCourt = state.courts.find((c) => c.id === targetCourtId);
                    if (!targetCourt || targetCourt.status === 'playing') return state;

                    const remainingSpace = 4 - targetCourt.players.length;
                    if (remainingSpace <= 0) return state;

                    const idsToMove = playerIds.slice(0, remainingSpace);

                    let newWaitingList = [...state.waitingList];
                    let newCourts = state.courts.map((c) => ({ ...c, players: [...c.players] }));

                    const playersData: Player[] = [];

                    idsToMove.forEach(id => {
                        const wIdx = newWaitingList.findIndex(p => p.id === id);
                        if (wIdx !== -1) {
                            playersData.push(newWaitingList[wIdx]);
                            newWaitingList.splice(wIdx, 1);
                        } else {
                            newCourts.forEach(c => {
                                const pIdx = c.players.findIndex(p => p.id === id);
                                if (pIdx !== -1 && c.id !== targetCourtId) {
                                    playersData.push(c.players[pIdx]);
                                    c.players.splice(pIdx, 1);
                                }
                            });
                        }
                    });

                    const finalCourts = newCourts.map(c => {
                        if (c.id === targetCourtId) {
                            return { ...c, players: [...c.players, ...playersData] };
                        }
                        return c;
                    });

                    return {
                        waitingList: newWaitingList,
                        courts: finalCourts,
                        lastUpdated: Date.now()
                    };
                }),

            startGame: (courtId) =>
                set((state) => {
                    const targetCourt = state.courts.find((c) => c.id === courtId);
                    if (!targetCourt || targetCourt.players.length < 4 || targetCourt.status === 'playing') {
                        return state;
                    }

                    const nowTime = new Date();
                    const hours = nowTime.getHours().toString().padStart(2, '0');
                    const minutes = nowTime.getMinutes().toString().padStart(2, '0');
                    const timeStr = `${hours}:${minutes}`;

                    const newRecord: MatchRecord = {
                        id: `m${Date.now()}-${courtId}`,
                        courtId: courtId,
                        players: [...targetCourt.players],
                        startTimeStr: timeStr,
                    };

                    const updatedCourts = state.courts.map((c) =>
                        c.id === courtId
                            ? {
                                ...c,
                                status: 'playing' as const,
                                startTime: Date.now(),
                                players: c.players.map(p => ({ ...p, matchCount: p.matchCount + 1 }))
                            }
                            : c
                    );

                    return {
                        courts: updatedCourts,
                        matchHistory: [newRecord, ...state.matchHistory],
                        lastUpdated: Date.now()
                    };
                }),

            endGame: (courtId) =>
                set((state) => {
                    const targetCourt = state.courts.find((c) => c.id === courtId);
                    if (!targetCourt || targetCourt.status !== 'playing') return state;

                    const finishedPlayers = targetCourt.players;

                    return {
                        courts: state.courts.map((c) =>
                            c.id === courtId
                                ? { ...c, players: [], status: 'waiting', startTime: undefined }
                                : c
                        ),
                        waitingList: [...state.waitingList, ...finishedPlayers.map(p => ({ ...p, waitingStartTime: Date.now() }))],
                        lastUpdated: Date.now()
                    };
                }),

            randomMatch: () =>
                set((state) => {
                    const getTierScore = (tier: Tier) => {
                        switch (tier) {
                            case 'A': return 5;
                            case 'B': return 4;
                            case 'C': return 3;
                            case 'D': return 2;
                            case 'E': return 1;
                            default: return 1;
                        }
                    };

                    const sortedWaiting = [...state.waitingList].sort((a, b) => {
                        if (a.matchCount !== b.matchCount) {
                            return a.matchCount - b.matchCount;
                        }
                        const timeA = a.waitingStartTime || 0;
                        const timeB = b.waitingStartTime || 0;
                        return timeA - timeB;
                    });

                    const newCourts = state.courts.map((c) => ({ ...c, players: [...c.players] }));
                    const currentWaiting = [...sortedWaiting];

                    for (const court of newCourts) {
                        if (court.status !== 'waiting') continue;

                        let wIndex = 0;
                        while (wIndex < currentWaiting.length && court.players.length < 4) {
                            const candidate = currentWaiting[wIndex];

                            if (court.players.length > 0) {
                                const allTiers = [...court.players, candidate].map((p) => getTierScore(p.tier));
                                const maxTier = Math.max(...allTiers);
                                const minTier = Math.min(...allTiers);

                                if (maxTier - minTier <= 1) {
                                    court.players.push(candidate);
                                    currentWaiting.splice(wIndex, 1);
                                } else {
                                    wIndex++;
                                }
                            } else {
                                court.players.push(candidate);
                                currentWaiting.splice(wIndex, 1);
                            }
                        }
                    }

                    return {
                        courts: newCourts,
                        waitingList: currentWaiting,
                        lastUpdated: Date.now()
                    };
                }),

            setIsCountingDown: (isCounting) => set({ isCountingDown: isCounting }),
            setCountdownTime: (time) => set({ countdownTime: time }),

            startAllReadyGames: () =>
                set((state) => {
                    const nowTime = new Date();
                    const hours = nowTime.getHours().toString().padStart(2, '0');
                    const minutes = nowTime.getMinutes().toString().padStart(2, '0');
                    const timeStr = `${hours}:${minutes}`;

                    const readyCourts = state.courts.filter(
                        (c) => c.status === 'waiting' && c.players.length === 4
                    );

                    if (readyCourts.length === 0) return state;

                    const newRecords: MatchRecord[] = readyCourts.map((court) => ({
                        id: `m${Date.now()}-${court.id}`,
                        courtId: court.id,
                        players: [...court.players],
                        startTimeStr: timeStr,
                    }));

                    const updatedCourts = state.courts.map((c) => {
                        const isReady = readyCourts.some((rc) => rc.id === c.id);
                        if (isReady) {
                            return {
                                ...c,
                                status: 'playing' as const,
                                startTime: Date.now(),
                                players: c.players.map((p) => ({ ...p, matchCount: p.matchCount + 1 })),
                            };
                        }
                        return c;
                    });

                    return {
                        courts: updatedCourts,
                        matchHistory: [...newRecords, ...state.matchHistory],
                        lastUpdated: Date.now()
                    };
                }),

            endAllGames: () =>
                set((state) => {
                    const playingCourts = state.courts.filter((c) => c.status === 'playing');
                    if (playingCourts.length === 0) return state;

                    const allFinishedPlayers = playingCourts.flatMap((c) => c.players);

                    return {
                        courts: state.courts.map((c) =>
                            c.status === 'playing'
                                ? { ...c, players: [], status: 'waiting', startTime: undefined }
                                : c
                        ),
                        waitingList: [...state.waitingList, ...allFinishedPlayers.map(p => ({ ...p, waitingStartTime: Date.now() }))],
                        lastUpdated: Date.now()
                    };
                }),

            startTournament: () =>
                set((state) => {
                    const now = Date.now();
                    return {
                        isEventRunning: true,
                        eventStartTime: now,
                        waitingList: state.waitingList.map(p => ({ ...p, waitingStartTime: now })),
                        lastUpdated: Date.now()
                    };
                }),

            endTournament: () =>
                set((state) => ({
                    isEventRunning: false,
                    eventStartTime: null,
                    waitingList: state.waitingList.map(p => ({ ...p, waitingStartTime: null })),
                    lastUpdated: Date.now()
                })),

            openConfirm: (message, onConfirm) =>
                set({
                    confirmModal: {
                        isOpen: true,
                        message,
                        onConfirm,
                    },
                }),

            closeConfirm: () =>
                set({
                    confirmModal: null,
                }),

            clearWaitingList: () =>
                set((state) => ({
                    waitingList: [],
                    lastUpdated: Date.now()
                })),

            addPlayersBulk: (input) =>
                set((state) => {
                    const parts = input.split(',');
                    const newPlayers: Player[] = [];
                    const now = Date.now();

                    parts.forEach((part, index) => {
                        const trimmed = part.trim();
                        const match = trimmed.match(/^([a-eA-E])\s*(.+)$/);
                        if (match) {
                            const tier = match[1].toUpperCase() as Tier;
                            const name = match[2].trim();
                            if (name) {
                                newPlayers.push({
                                    id: `w${now}-${index}`,
                                    name,
                                    tier,
                                    matchCount: 0,
                                    waitingStartTime: state.isEventRunning ? now : null
                                });
                            }
                        }
                    });

                    if (newPlayers.length === 0) return state;
                    return { waitingList: [...state.waitingList, ...newPlayers], lastUpdated: Date.now() };
                }),

            initializeData: () => {
                const state = get();
                
                // 이미 초기화되었거나 사용자가 리셋한 경우 무시
                if (state.isInitialized) {
                    return;
                }

                const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
                
                // 일주일 경과 체크 및 자동 초기화
                if (state.lastUpdated && (Date.now() - state.lastUpdated > ONE_WEEK)) {
                    set({ 
                        waitingList: getRandomInitialWaitingList(), 
                        courts: initialCourts.map(c => ({ ...c, players: [], status: 'waiting' as const })),
                        matchHistory: [],
                        lastUpdated: Date.now(),
                        isInitialized: true
                    });
                    return;
                }

                // 데이터가 이미 있으면(persistence 로드 성공) 무시
                if (state.waitingList.length > 0 || state.courts.some(c => c.players.length > 0)) {
                    set({ isInitialized: true });
                    return;
                }
                
                // 데이터가 아예 없는 경우에만 랜덤 초기 데이터 생성
                set({ 
                    waitingList: getRandomInitialWaitingList(), 
                    lastUpdated: Date.now(),
                    isInitialized: true
                });
            },

            resetAll: () => 
                set({
                    courts: initialCourts.map(c => ({ ...c, players: [], status: 'waiting' as const, startTime: undefined })),
                    waitingList: [],
                    matchHistory: [],
                    isEventRunning: false,
                    eventStartTime: null,
                    lastUpdated: Date.now(),
                    isInitialized: true // 리셋 후에는 다시 자동 생성되지 않도록 설정
                }),
        }),
        {
            name: 'rally-board-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                waitingList: state.waitingList,
                courts: state.courts,
                matchHistory: state.matchHistory,
                lastUpdated: state.lastUpdated,
                isEventRunning: state.isEventRunning,
                eventStartTime: state.eventStartTime,
                tournamentTitle: state.tournamentTitle,
                isInitialized: state.isInitialized
            }),
        }
    )
);
