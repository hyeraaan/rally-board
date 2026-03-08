import { create } from 'zustand';

export type Tier = 'A' | 'B' | 'C' | 'D' | 'E';

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

    // Actions
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
}

const initialCourts: Court[] = [
    {
        id: 1,
        players: [
            { id: 'p1', name: '변우석', tier: 'A', matchCount: 0 },
            { id: 'p2', name: '박보검', tier: 'A', matchCount: 0 },
            { id: 'p3', name: '이재욱', tier: 'B', matchCount: 0 },
            { id: 'p4', name: '남주혁', tier: 'B', matchCount: 0 },
        ],
        status: 'waiting',
    },
    {
        id: 2,
        players: [
            { id: 'p5', name: '차은우', tier: 'C', matchCount: 0 },
            { id: 'p6', name: '송강', tier: 'C', matchCount: 0 },
        ],
        status: 'waiting',
    },
    { id: 3, players: [], status: 'waiting' },
];

const initialWaitingList: Player[] = [
    { id: 'w1', name: '로운', tier: 'A', matchCount: 0 },
    { id: 'w2', name: '이도현', tier: 'B', matchCount: 0 },
    { id: 'w3', name: '안효섭', tier: 'A', matchCount: 0 },
    { id: 'w4', name: '배인혁', tier: 'C', matchCount: 0 },
    { id: 'w5', name: '최현욱', tier: 'B', matchCount: 0 },
    { id: 'w6', name: '김영대', tier: 'A', matchCount: 0 },
    { id: 'w7', name: '김지원', tier: 'A', matchCount: 0 },
    { id: 'w8', name: '한소희', tier: 'B', matchCount: 0 },
    { id: 'w9', name: '고윤정', tier: 'B', matchCount: 0 },
    { id: 'w10', name: '김유정', tier: 'C', matchCount: 0 },
    { id: 'w11', name: '조이현', tier: 'A', matchCount: 0 },
    { id: 'w12', name: '박은빈', tier: 'A', matchCount: 0 },
    { id: 'w13', name: '문가영', tier: 'C', matchCount: 0 },
    { id: 'w14', name: '노윤서', tier: 'D', matchCount: 0 },
];

export const useBoardStore = create<BoardState>((set) => ({
    courts: initialCourts,
    waitingList: initialWaitingList,
    matchHistory: [],
    isEditMode: false,
    isCountingDown: false,
    countdownTime: 3,
    isEventRunning: false,
    eventStartTime: null,
    confirmModal: null,

    setCourts: (courts) => set({ courts }),
    setWaitingList: (waitingList) => set({ waitingList }),
    toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

    addCourt: () =>
        set((state) => {
            const newId = state.courts.length > 0 ? Math.max(...state.courts.map((c) => c.id)) + 1 : 1;
            return { courts: [...state.courts, { id: newId, players: [], status: 'waiting' }] };
        }),

    deleteCourt: (courtId) =>
        set((state) => {
            const courtToDelete = state.courts.find((c) => c.id === courtId);
            if (!courtToDelete) return state;

            return {
                waitingList: [...state.waitingList, ...courtToDelete.players.map(p => ({ ...p, waitingStartTime: state.isEventRunning ? Date.now() : null }))],
                courts: state.courts.filter((c) => c.id !== courtId),
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
            return { waitingList: [...state.waitingList, newPlayer] };
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
            };
        }),

    movePlayer: (playerId, toId) =>
        set((state) => {
            let targetPlayer: Player | undefined;
            let fromWaitingList = false;

            // 1. 대기 명단에서 찾기
            const inWaiting = state.waitingList.find((p) => p.id === playerId);
            if (inWaiting) {
                targetPlayer = inWaiting;
                fromWaitingList = true;
            }

            // 2. 대기 명단에 없다면 코트에서 찾기
            if (!targetPlayer) {
                for (const court of state.courts) {
                    const inCourt = court.players.find((p) => p.id === playerId);
                    if (inCourt) {
                        targetPlayer = inCourt;
                        break;
                    }
                }
            }

            if (!targetPlayer) return state; // 찾지 못하면 무시

            // 2.5 목적지가 다른 선수인 경우 (그 선수가 속한 컨테이너로 toId를 치환하고 해당 선수의 인덱스 파악)
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

            // 3. 목적지가 꽉 찼는지(코트 당 최대 4명) 확인
            if (typeof actualToId === 'number') {
                const destCourt = state.courts.find((c) => c.id === actualToId);
                // 꽉 찼고(4명 이상) 이미 그 코트에 있던 선수가 아니라면 이동 금지
                if (destCourt && destCourt.players.length >= 4) {
                    const isAlreadyInDest = destCourt.players.some((p) => p.id === playerId);
                    if (!isAlreadyInDest) return state;
                }
            }

            // 4. 새로운 상태 배열 생성 (원래 있던 곳에서 삭제)
            let newWaitingList = [...state.waitingList];
            const newCourts = state.courts.map((c) => ({ ...c, players: [...c.players] }));

            if (fromWaitingList) {
                newWaitingList = newWaitingList.filter((p) => p.id !== playerId);
            } else {
                for (const court of newCourts) {
                    court.players = court.players.filter((p) => p.id !== playerId);
                }
            }

            // 5. 목적지 특정 위치(인덱스)에 추가
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
                    // 코트로 들어갈 때는 대기 시간 초기화
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

            // 1. 소스 위치에서 제거 및 데이터 수집
            idsToMove.forEach(id => {
                // 대기명단에서 찾기
                const wIdx = newWaitingList.findIndex(p => p.id === id);
                if (wIdx !== -1) {
                    playersData.push(newWaitingList[wIdx]);
                    newWaitingList.splice(wIdx, 1);
                } else {
                    // 다른 코트에서 찾기
                    newCourts.forEach(c => {
                        const pIdx = c.players.findIndex(p => p.id === id);
                        if (pIdx !== -1 && c.id !== targetCourtId) {
                            playersData.push(c.players[pIdx]);
                            c.players.splice(pIdx, 1);
                        }
                    });
                }
            });

            // 2. 타겟 코트에 추가
            const finalCourts = newCourts.map(c => {
                if (c.id === targetCourtId) {
                    return { ...c, players: [...c.players, ...playersData] };
                }
                return c;
            });

            return {
                waitingList: newWaitingList,
                courts: finalCourts,
            };
        }),

    startGame: (courtId) =>
        set((state) => {
            const targetCourt = state.courts.find((c) => c.id === courtId);
            if (!targetCourt || targetCourt.players.length < 4 || targetCourt.status === 'playing') {
                return state;
            }

            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
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
            };
        }),

    endGame: (courtId) =>
        set((state) => {
            const targetCourt = state.courts.find((c) => c.id === courtId);
            if (!targetCourt || targetCourt.status !== 'playing') return state;

            // 게임에 참여했던 4명의 선수를 추출하여 대기 명단 끝으로 이동
            const finishedPlayers = targetCourt.players;

            return {
                courts: state.courts.map((c) =>
                    c.id === courtId
                        ? { ...c, players: [], status: 'waiting', startTime: undefined }
                        : c
                ),
                waitingList: [...state.waitingList, ...finishedPlayers.map(p => ({ ...p, waitingStartTime: Date.now() }))],
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

            // 1. 대기 명단 우선순위 정렬
            // 우선순위: 1. 경기 횟수 적은 순, 2. 대기 시작 시간 오래된 순
            const sortedWaiting = [...state.waitingList].sort((a, b) => {
                if (a.matchCount !== b.matchCount) {
                    return a.matchCount - b.matchCount;
                }
                const timeA = a.waitingStartTime || 0;
                const timeB = b.waitingStartTime || 0;
                return timeA - timeB;
            });

            // 2. 새로운 코트 상태 생성 준비
            const newCourts = state.courts.map((c) => ({ ...c, players: [...c.players] }));
            const currentWaiting = [...sortedWaiting];

            // 3. 빈 자리가 있는 대기 중인 코트들에 순서대로 채워 넣기
            for (const court of newCourts) {
                if (court.status !== 'waiting') continue;

                // 코트에 자리가 빌 때까지 반복
                let wIndex = 0;
                while (wIndex < currentWaiting.length && court.players.length < 4) {
                    const candidate = currentWaiting[wIndex];

                    // 현재 코트 안의 인원들과 급수 차이 검증
                    if (court.players.length > 0) {
                        const allTiers = [...court.players, candidate].map((p) => getTierScore(p.tier));
                        const maxTier = Math.max(...allTiers);
                        const minTier = Math.min(...allTiers);

                        // 최고 급수와 최저 급수 차이가 1 이하일 때만 합류
                        if (maxTier - minTier <= 1) {
                            court.players.push(candidate);
                            currentWaiting.splice(wIndex, 1);
                        } else {
                            // 급수 차이가 너무 크면 다음 후보자 확인
                            wIndex++;
                        }
                    } else {
                        // 코트가 비어있으면 가장 우선순위 높은 사람 무조건 투입
                        court.players.push(candidate);
                        currentWaiting.splice(wIndex, 1);
                    }
                }
            }

            return {
                courts: newCourts,
                waitingList: currentWaiting,
            };
        }),

    setIsCountingDown: (isCounting) => set({ isCountingDown: isCounting }),
    setCountdownTime: (time) => set({ countdownTime: time }),

    startAllReadyGames: () =>
        set((state) => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
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
            };
        }),

    startTournament: () =>
        set((state) => {
            const now = Date.now();
            return {
                isEventRunning: true,
                eventStartTime: now,
                waitingList: state.waitingList.map(p => ({ ...p, waitingStartTime: now }))
            };
        }),

    endTournament: () =>
        set((state) => ({
            isEventRunning: false,
            eventStartTime: null,
            waitingList: state.waitingList.map(p => ({ ...p, waitingStartTime: null }))
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
}));
