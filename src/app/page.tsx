'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import BadmintonCourt from '@/components/BadmintonCourt';
import PlayerMagnet from '@/components/PlayerMagnet';
import AddCourtButton from '@/components/AddCourtButton';
import AddPlayerForm from '@/components/AddPlayerForm';
import MatchHistoryModal from '@/components/MatchHistoryModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  DndContext, DragEndEvent, DragStartEvent, useDroppable,
  DragOverlay, useSensors, useSensor, PointerSensor, closestCorners
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import {
  Shuffle, Eraser, Globe, Monitor, Gamepad2, History, ChevronLeft, ChevronRight, Play, PlayCircle, Square, Trophy, Clock, X
} from 'lucide-react';

import { useBoardStore, Tier, Player } from '@/store/useBoardStore';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLanguage();
  const {
    courts,
    waitingList,
    matchHistory,
    isEditMode,
    toggleEditMode,
    addCourt,
    deleteCourt,
    deletePlayer,
    addPlayer,
    movePlayer,
    randomMatch,
    isCountingDown,
    countdownTime,
    setIsCountingDown,
    setCountdownTime,
    startAllReadyGames,
    endAllGames,
    isEventRunning,
    eventStartTime,
    startTournament,
    endTournament,
    openConfirm,
    moveMultiplePlayers
  } = useBoardStore();

  const [eventTime, setEventTime] = useState('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEventRunning && eventStartTime) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.floor((now - eventStartTime) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        setEventTime(`${h}:${m}:${s}`);
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setEventTime('00:00:00');
    }
    return () => clearInterval(interval);
  }, [isEventRunning, eventStartTime]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isWaitingListOpen, setIsWaitingListOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (playerId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= 4) {
        alert(t.alertMaxPlayers);
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const activePlayer = activeId
    ? [...waitingList, ...courts.flatMap(c => c.players)].find(p => p.id === activeId)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이상 이동해야 드래그로 인식 (클릭 이벤트 보장)
      },
    })
  );

  const { setNodeRef: setWaitingListRef } = useDroppable({
    id: 'waiting-list',
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // 드래그한 원소가 선택 목록에 없다면 선택 목록 초기화
    if (!selectedIds.includes(active.id as string)) {
      setSelectedIds([]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string | number;

    if (activeId !== overId) {
      if (typeof overId === 'number' && selectedIds.length > 0 && selectedIds.includes(activeId)) {
        // 다중 이동 (코트로 드롭했을 때만)
        if (useBoardStore.getState().moveMultiplePlayers) {
          useBoardStore.getState().moveMultiplePlayers(selectedIds, overId);
          setSelectedIds([]); // 이동 후 선택 해제
        }
      } else {
        // 단일 이동
        if (movePlayer) {
          movePlayer(activeId, overId);
        }
      }
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStartTournament = () => {
    setIsCountingDown(true);
    setCountdownTime(3);

    const timer = setInterval(() => {
      useBoardStore.getState().setCountdownTime(useBoardStore.getState().countdownTime - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      setIsCountingDown(false);
      startTournament();
    }, 3000);
  };

  const handleEndTournament = () => {
    openConfirm(
      t.tournamentEndConfirm,
      () => endTournament()
    );
  };

  const isAnyGamePlaying = courts.some(c => c.status === 'playing');

  if (!isMounted) {
    // 서버 사이드와 첫 번째 클라이언트 렌더링 시점에는 
    // 테마나 언어에 의존하지 않는 정적인 껍데기만 렌더링하여 Hydration 불일치를 방지합니다.
    return <main className={styles.mainContainer} />;
  }

  return (
    <main className={`${styles.mainContainer} ${theme === 'retro' ? styles.retroMain : ''}`}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.contentWrapper}>
          {/* 1. 왼쪽 영역 코트 판 */}
          <section
            className={styles.courtArea}
            onClick={() => {
              if (isWaitingListOpen) setIsWaitingListOpen(false);
            }}
          >
            <div className={styles.titleRow}>
              <div className={styles.headerContainer}>
                <div className={styles.titleGroup}>
                  <h1 className={styles.areaTitle}>{t.appTitle}</h1>
                  {isEventRunning && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: theme === 'retro' ? '#fff' : 'rgba(0,0,0,0.5)',
                      padding: '4px 12px',
                      borderRadius: theme === 'retro' ? '0' : '20px',
                      border: theme === 'retro' ? '3px solid #000' : '1px solid rgba(255,255,255,0.2)',
                      color: theme === 'retro' ? '#000' : '#10b981',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                    }}>
                      <Clock size={20} />
                      {eventTime}
                    </div>
                  )}
                </div>
                <div className={styles.buttonGroup}>
                  {isEventRunning ? (
                    <button
                      type="button"
                      className={theme === 'retro' ? 'nes-btn is-error' : styles.themeToggleBtn}
                      style={theme === 'retro' ? { display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 8px', fontSize: '12px', height: '36px' } : { backgroundColor: '#ef4444', color: 'white' }}
                      onClick={handleEndTournament}
                      title={t.endTournamentTooltip}
                    >
                      <Trophy size={theme === 'retro' ? 20 : 16} fill={theme === 'retro' ? 'currentColor' : 'white'} /> {t.tournamentEnd}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={theme === 'retro' ? 'nes-btn is-primary' : styles.themeToggleBtn}
                      style={theme === 'retro' ? { display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 8px', fontSize: '12px', height: '36px' } : { backgroundColor: '#10b981', color: 'white' }}
                      onClick={handleStartTournament}
                      title={t.startTournamentTooltip}
                    >
                      <Play size={theme === 'retro' ? 20 : 16} fill={theme === 'retro' ? 'currentColor' : 'white'} /> {t.tournamentStart}
                    </button>
                  )}
                  <button
                    type="button"
                    className={theme === 'retro' ? 'nes-btn' : styles.themeToggleBtn}
                    style={theme === 'retro' ? { display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 8px', fontSize: '12px', height: '36px' } : undefined}
                    onClick={() => setIsHistoryModalOpen(true)}
                    title={t.historyTooltip}
                  >
                    <History size={theme === 'retro' ? 20 : 16} /> {t.historyBtn} ({matchHistory.length})
                  </button>
                  <button
                    type="button"
                    className={theme === 'retro' ? `nes-btn ${isWaitingListOpen ? 'is-success' : ''}` : `${styles.themeToggleBtn} ${isWaitingListOpen ? styles.activeHeaderBtn : ''}`}
                    style={theme === 'retro' ? { display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 8px', fontSize: '12px', height: '36px' } : undefined}
                    onClick={() => setIsWaitingListOpen(!isWaitingListOpen)}
                    title={isWaitingListOpen ? t.closeWaitingListTooltip : t.openWaitingListTooltip}
                  >
                    <Monitor size={theme === 'retro' ? 20 : 16} /> {t.waitingList}
                  </button>
                  <button
                    type="button"
                    className={theme === 'retro' ? `nes-btn ${isEditMode ? 'is-error' : ''} ${styles.retroHeaderBtn}` : `${styles.themeIconBtn} ${isEditMode ? styles.editActiveBtn : ''}`}
                    onClick={toggleEditMode}
                    style={theme === 'retro' ? { width: '36px', height: '36px', fontSize: '16px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' } : undefined}
                    title="선수 삭제 모드"
                    aria-label="선수 삭제 모드"
                  >
                    <Eraser size={20} />
                  </button>
                  <button
                    type="button"
                    className={theme === 'retro' ? `nes-btn ${styles.retroHeaderBtn}` : styles.themeIconBtn}
                    onClick={toggleLang}
                    style={theme === 'retro' ? { width: '36px', height: '36px', fontSize: '16px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' } : undefined}
                    title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
                    aria-label={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
                  >
                    <Globe size={20} />
                  </button>
                  <button
                    type="button"
                    className={theme === 'retro' ? `nes-btn ${styles.retroHeaderBtn}` : styles.themeIconBtn}
                    onClick={toggleTheme}
                    style={theme === 'retro' ? { width: '36px', height: '36px', fontSize: '16px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' } : undefined}
                    title={theme === 'retro' ? '클래식 모드로 전환' : '레트로 모드로 전환'}
                    aria-label={theme === 'retro' ? '클래식 모드로 전환' : '레트로 모드로 전환'}
                  >
                    <Gamepad2 size={20} />
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.courtGrid}>
              {courts.map((court) => (
                <div key={court.id} className={styles.courtGridItem}>
                  <BadmintonCourt
                    courtNumber={court.id}
                    players={court.players}
                    status={court.status}
                    startTime={court.startTime}
                    onDelete={deleteCourt}
                    onDeletePlayer={deletePlayer}
                    isEditMode={isEditMode}
                  />
                </div>
              ))}
            </div>
            {/* 하단 전체 가로를 차지하는 코트 추가 버튼 */}
            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
              <AddCourtButton onClick={addCourt} />
            </div>
          </section>

          {/* 2. 오른쪽 영역 대기 명단 (사이드바 레이어) */}
          <aside className={`${styles.waitingArea} ${isWaitingListOpen ? styles.isOpen : ''}`} ref={setWaitingListRef}>
            <div className={styles.sidebarContent}>
              <div className={styles.sidebarHeader}>
                <h2 className={`${styles.areaTitle} ${theme === 'retro' ? 'nes-text is-primary' : ''}`}>
                  {t.waitingList} ({waitingList.length})
                </h2>
                <div className={styles.sidebarButtonGroup}>
                  <button
                    type="button"
                    className={theme === 'retro' ? 'nes-btn is-warning' : styles.randomBtn}
                    onClick={randomMatch}
                    title="빈 코트에 인원을 랜덤으로 채웁니다."
                  >
                    <Shuffle size={theme === 'retro' ? 20 : 16} /> {t.randomMatchBtn}
                  </button>
                  <button
                    type="button"
                    className={theme === 'retro' ? 'nes-btn is-error' : styles.sidebarCloseBtn}
                    style={theme === 'retro' ? { padding: '2px 8px', fontSize: '0.8rem' } : undefined}
                    onClick={() => setIsWaitingListOpen(false)}
                    title="대기명단 닫기"
                  >
                    {theme === 'retro' ? 'X' : <X size={20} />}
                  </button>
                </div>
              </div>

              {/* 다중 선택 퀵 코트 배치 메뉴 */}
              {selectedIds.length >= 2 && (
                <div className={styles.quickAddContainer}>
                  <span className={styles.quickAddTitle}>
                    {selectedIds.length}명을 배치할 코트를 선택하세요:
                  </span>
                  <div className={styles.quickAddButtons}>
                    {courts.map((court) => (
                      <button
                        key={court.id}
                        className={theme === 'retro' ? 'nes-btn is-primary' : styles.quickAddBtn}
                        style={theme === 'retro' ? { padding: '4px 8px', fontSize: '10px', flex: '1', minWidth: '60px' } : undefined}
                        onClick={() => moveMultiplePlayers(selectedIds, court.id)}
                      >
                        {t.courtNumber(court.id)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.playerListContainer}>
                <SortableContext items={waitingList.map((p) => p.id)} strategy={rectSortingStrategy}>
                  {waitingList.map((player) => (
                    <PlayerMagnet
                      key={player.id}
                      id={player.id}
                      name={player.name}
                      tier={player.tier}
                      matchCount={player.matchCount}
                      waitingStartTime={player.waitingStartTime}
                      onSelect={handleSelect}
                      isSelected={selectedIds.includes(player.id)}
                      onDelete={deletePlayer}
                      isEditMode={isEditMode}
                    />
                  ))}
                </SortableContext>
              </div>
              {/* 선수 추가 폼 (원래대로 하단 배치) */}
              <AddPlayerForm onAdd={addPlayer} />
            </div>
          </aside>
        </div>
        <DragOverlay adjustScale={true}>
          {activePlayer ? (
            <div style={{ position: 'relative' }}>
              {/* 다중 선택 시 겹쳐 보이는 효과 */}
              {selectedIds.length > 1 && selectedIds.includes(activePlayer.id) ? (
                selectedIds.slice(0, 4).map((id, index) => {
                  const p = [...waitingList, ...courts.flatMap(c => c.players)].find(player => player.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} style={{
                      position: index === 0 ? 'relative' : 'absolute',
                      top: index * 4,
                      left: index * 4,
                      zIndex: 10 - index,
                      opacity: index === 0 ? 1 : 0.4
                    }}>
                      <PlayerMagnet
                        id={p.id}
                        name={p.name}
                        tier={p.tier}
                        matchCount={p.matchCount}
                        isEditMode={isEditMode}
                      />
                    </div>
                  );
                })
              ) : (
                <PlayerMagnet
                  id={activePlayer.id}
                  name={activePlayer.name}
                  tier={activePlayer.tier}
                  matchCount={activePlayer.matchCount}
                  isEditMode={isEditMode}
                />
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <MatchHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <ConfirmModal />

      {/* 카운트다운 오버레이 */}
      {
        isCountingDown && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            flexDirection: 'column',
            backdropFilter: 'blur(4px)'
          }}>
            <div
              className={theme === 'retro' ? 'nes-text is-warning' : ''}
              style={{
                fontSize: '12rem',
                fontWeight: 900,
                color: theme === 'retro' ? undefined : '#f59e0b',
                animation: 'pulse 1s infinite',
                textShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
              }}
            >
              {countdownTime}
            </div>
            <style jsx global>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
          </div>
        )
      }
    </main>
  );
}
