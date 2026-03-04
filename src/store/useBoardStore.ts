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
    },
    {
        id: 2,
        players: [
            { id: 'p5', name: '차은우', tier: 'C' },
            { id: 'p6', name: '송강', tier: 'C' },
        ],
    },
    { id: 3, players: [] },
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
            return { courts: [...state.courts, { id: newId, players: [] }] };
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

            // 2.5 목적지가 다른 선수인 경우 (그 선수가 속한 컨테이너로 toId를 치환)
            let actualToId = toId;
            if (typeof toId === 'string' && toId !== 'waiting-list') {
                const isOverWaitingPlayer = state.waitingList.some(p => p.id === toId);
                if (isOverWaitingPlayer) {
                    actualToId = 'waiting-list';
                } else {
                    const overCourt = state.courts.find(c => c.players.some(p => p.id === toId));
                    if (overCourt) {
                        actualToId = overCourt.id;
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
            let newWaitingList = fromWaitingList
                ? state.waitingList.filter((p) => p.id !== playerId)
                : [...state.waitingList];

            const newCourts = state.courts.map((court) => {
                let updatedPlayers = court.players.filter((p) => p.id !== playerId);
                // 목적지가 현 코트면 추가
                if (court.id === actualToId) {
                    updatedPlayers = [...updatedPlayers, targetPlayer!];
                }
                return { ...court, players: updatedPlayers };
            });

            // 5. 목적지가 대기 명단이면 추가
            if (actualToId === 'waiting-list') {
                newWaitingList = [...newWaitingList, targetPlayer!];
            }

            return {
                courts: newCourts,
                waitingList: newWaitingList,
            };
        }),
}));
