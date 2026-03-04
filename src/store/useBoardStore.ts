import { create } from 'zustand';

export type Tier = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Player {
    id: string;
    name: string;
    tier: Tier;
}

export interface Court {
    id: number;
    players: Player[];
    status: 'waiting' | 'playing';
    startTime?: number;
}

interface BoardState {
    courts: Court[];
    waitingList: Player[];
    isEditMode: boolean;

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
    startGame: (courtId: number) => void;
    endGame: (courtId: number) => void;
    randomMatch: () => void;
}

const initialCourts: Court[] = [
    {
        id: 1,
        players: [
            { id: 'p1', name: '변우석', tier: 'A' },
            { id: 'p2', name: '박보검', tier: 'A' },
            { id: 'p3', name: '이재욱', tier: 'B' },
            { id: 'p4', name: '남주혁', tier: 'B' },
        ],
        status: 'waiting',
    },
    {
        id: 2,
        players: [
            { id: 'p5', name: '차은우', tier: 'C' },
            { id: 'p6', name: '송강', tier: 'C' },
        ],
        status: 'waiting',
    },
    { id: 3, players: [], status: 'waiting' },
];

const initialWaitingList: Player[] = [
    { id: 'w1', name: '로운', tier: 'A' },
    { id: 'w2', name: '이도현', tier: 'B' },
    { id: 'w3', name: '안효섭', tier: 'A' },
    { id: 'w4', name: '배인혁', tier: 'C' },
    { id: 'w5', name: '최현욱', tier: 'B' },
    { id: 'w6', name: '김영대', tier: 'A' },
    { id: 'w7', name: '김지원', tier: 'A' },
    { id: 'w8', name: '한소희', tier: 'B' },
    { id: 'w9', name: '고윤정', tier: 'B' },
    { id: 'w10', name: '김유정', tier: 'C' },
    { id: 'w11', name: '조이현', tier: 'A' },
    { id: 'w12', name: '박은빈', tier: 'A' },
    { id: 'w13', name: '문가영', tier: 'C' },
    { id: 'w14', name: '노윤서', tier: 'D' },
];

export const useBoardStore = create<BoardState>((set) => ({
    courts: initialCourts,
    waitingList: initialWaitingList,
    isEditMode: false,

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
                waitingList: [...state.waitingList, ...courtToDelete.players],
                courts: state.courts.filter((c) => c.id !== courtId),
            };
        }),

    addPlayer: (name, tier) =>
        set((state) => {
            const newId = `w${Date.now()}`;
            return { waitingList: [...state.waitingList, { id: newId, name, tier }] };
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
                if (targetIndex !== -1) {
                    newWaitingList.splice(targetIndex, 0, targetPlayer!);
                } else {
                    newWaitingList.push(targetPlayer!);
                }
            } else {
                const destCourt = newCourts.find((c) => c.id === actualToId);
                if (destCourt) {
                    if (targetIndex !== -1) {
                        destCourt.players.splice(targetIndex, 0, targetPlayer!);
                    } else {
                        destCourt.players.push(targetPlayer!);
                    }
                }
            }

            return {
                courts: newCourts,
                waitingList: newWaitingList,
            };
        }),

    startGame: (courtId) =>
        set((state) => ({
            courts: state.courts.map((c) =>
                c.id === courtId && c.players.length === 4
                    ? { ...c, status: 'playing', startTime: Date.now() }
                    : c
            ),
        })),

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
                waitingList: [...state.waitingList, ...finishedPlayers],
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

            // 1. 대기 명단 복사 및 셔플 (Fisher-Yates)
            const shuffledWaiting = [...state.waitingList];
            for (let i = shuffledWaiting.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledWaiting[i], shuffledWaiting[j]] = [shuffledWaiting[j], shuffledWaiting[i]];
            }

            // 2. 새로운 코트 상태 생성 준비
            const newCourts = state.courts.map((c) => ({ ...c, players: [...c.players] }));
            const remainingWaitingList: Player[] = [];

            // 3. 빈 자리가 있는 대기 중인 코트들에 순서대로 채워 넣기 (급수 차이 조건 1 이하)
            for (const court of newCourts) {
                if (court.status !== 'waiting') continue;

                // 대기 명단 인원들을 하나씩 꺼내보며 코트에 투입 가능한지 여부 판단
                let wIndex = 0;
                while (wIndex < shuffledWaiting.length && court.players.length < 4) {
                    const candidate = shuffledWaiting[wIndex];

                    // 현재 코트 안의 인원들 + 후보 인원의 급수들 나열
                    const allTiers = [...court.players, candidate].map((p) => getTierScore(p.tier));
                    const maxTier = Math.max(...allTiers);
                    const minTier = Math.min(...allTiers);

                    // 최고 급수와 최저 급수 차이가 1 이하(2 미만)일 때만 합류 허용
                    if (maxTier - minTier <= 1) {
                        court.players.push(candidate);
                        shuffledWaiting.splice(wIndex, 1); // 투입 성공 시 배열에서 제거 (인덱스 유지)
                    } else {
                        // 투입 실패 시 다음 후보 탐색
                        wIndex++;
                    }
                }
            }

            // 4. 상태 업데이트 (어느 코트에도 못 들어가고 남은 셔플 배열을 대기 리스트로)
            return {
                courts: newCourts,
                waitingList: shuffledWaiting,
            };
        }),
}));
