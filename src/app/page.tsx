'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './page.module.css';
import BadmintonCourt from '@/components/BadmintonCourt';
import PlayerMagnet from '@/components/PlayerMagnet';
import AddCourtButton from '@/components/AddCourtButton';
import AddPlayerForm from '@/components/AddPlayerForm';
import MatchHistoryModal from '@/components/MatchHistoryModal';
import ConfirmModal from '@/components/ConfirmModal';
import SettingsModal from '@/components/SettingsModal';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  DndContext, DragEndEvent, DragStartEvent, useDroppable,
  DragOverlay, useSensors, useSensor, PointerSensor, closestCorners
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import {
  Shuffle, Eraser, Globe, Monitor, Gamepad2, History, ChevronLeft, ChevronRight, Play, Trophy, Clock, X, Plus, Minus, Settings
} from 'lucide-react';

import { useBoardStore, Player } from '@/store/useBoardStore';

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
    movePlayer,
    randomMatch,
    isCountingDown,
    countdownTime,
    setIsCountingDown,
    setCountdownTime,
    isEventRunning,
    eventStartTime,
    startTournament,
    endTournament,
    openConfirm,
    moveMultiplePlayers,
    initializeData,
    setActivePopoverPlayerId,
    tournamentTitle,
    setTournamentTitle,
    clearWaitingList
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
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 설정 모달
  const sliderContainerRef = useRef<HTMLDivElement>(null); // 뷰포트 참조
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  // 스크롤 위치에 따라 화살표 상태 업데이트
  const handleScroll = useCallback(() => {
    if (!sliderContainerRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = sliderContainerRef.current;
    if (clientWidth === 0) return;
    
    setIsScrollable(scrollWidth > clientWidth + 2); // 2px 여유
    setCanScrollLeft(scrollLeft > 2); // 오차 및 바운스 방지를 위해 2px 임계값 적용
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2); // 2px 오차 허용
  }, []);

  useEffect(() => {
    const el = sliderContainerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll);
      // 초기 렌더링 이후 레이아웃 확정 시점에 화살표 렌더링
      const timer = setTimeout(handleScroll, 100);
      return () => {
        el.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
        clearTimeout(timer);
      };
    }
  }, [handleScroll]);

  // 대기명단이 변경될 때마다 화살표 갱신
  useEffect(() => {
    const timer = setTimeout(handleScroll, 150);
    return () => clearTimeout(timer);
  }, [waitingList.length, handleScroll]);

  // 버튼 클릭 시 한 화면만큼 스크롤
  const scrollPrev = () => {
    if (!sliderContainerRef.current) return;
    sliderContainerRef.current.scrollBy({ left: -sliderContainerRef.current.clientWidth, behavior: 'smooth' });
    setTimeout(handleScroll, 400); // 애니메이션 종료 후 확실히 상태 갱신
  };

  const scrollNext = () => {
    if (!sliderContainerRef.current) return;
    sliderContainerRef.current.scrollBy({ left: sliderContainerRef.current.clientWidth, behavior: 'smooth' });
    setTimeout(handleScroll, 400);
  };

  const handleSelect = (playerId: string) => {
    setSelectedIds((prev: string[]) => {
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
    // 앱 시작 시 데이터가 비어있으면 랜덤 연예인 명단 생성
    initializeData();
  }, []);

  // 브라우저 타이틀 동적 업데이트 (L10N + 대회명)
  useEffect(() => {
    if (!isMounted) return;
    const baseTitle = t.documentTitle;
    if (tournamentTitle) {
      document.title = `${tournamentTitle} | ${t.appTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [isMounted, t.documentTitle, t.appTitle, tournamentTitle]);

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
    return (
      <div className={styles.container} style={{ opacity: 0 }}>
        {/* 서버 렌더링 시에는 빈 껍데기만 보여주어 하이드레이션 충돌 방지 */}
      </div>
    );
  }

  return (
        <main className={`${styles.mainContainer} ${theme === 'retro' ? styles.retroMain : ''}`}>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className={styles.contentWrapper}>
                    {/* 1. 왼쪽 영역 코트 판 */}
                    <section
                        className={`${styles.courtArea} ${isWaitingListOpen ? styles.shifted : ''}`}
                        onClick={() => {
                            if (isWaitingListOpen) setIsWaitingListOpen(false);
                            setActivePopoverPlayerId(null);
                        }}
                    >
                        <div className={styles.titleRow}>
                            <div className={styles.headerContainer}>
                                <div className={styles.titleGroup}>
                                    <div className={styles.tournamentTitleWrapper}>
                                        <div className={styles.inputMirror} aria-hidden="true">
                                            {tournamentTitle || t.tournamentTitlePlaceholder}
                                        </div>
                                        <input
                                            type="text"
                                            className={styles.tournamentTitleInput}
                                            value={tournamentTitle}
                                            onChange={(e) => setTournamentTitle(e.target.value.slice(0, 10))}
                                            placeholder={t.tournamentTitlePlaceholder}
                                            maxLength={10}
                                        />
                                        <span className={styles.serviceWatermark}>{t.appTitle}</span>
                                    </div>
                                </div>
                                <div className={styles.buttonGroup}>
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
                                            style={theme === 'retro' ? { display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 16px', fontSize: '12px', height: '36px', whiteSpace: 'nowrap' } : { backgroundColor: '#10b981', color: 'white', whiteSpace: 'nowrap' }}
                                            onClick={handleStartTournament}
                                            title={t.startTournamentTooltip}
                                        >
                                            <Play size={theme === 'retro' ? 20 : 16} fill={theme === 'retro' ? 'currentColor' : 'white'} /> {t.tournamentStart}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={theme === 'retro' ? 'nes-btn' : styles.themeToggleBtn}
                                        style={theme === 'retro' ? { display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 16px', fontSize: '12px', height: '36px', whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap' }}
                                        onClick={() => setIsHistoryModalOpen(true)}
                                        title={t.historyTooltip}
                                    >
                                        <History size={theme === 'retro' ? 20 : 16} /> {t.historyBtn} ({matchHistory.length})
                                    </button>
                                    <button
                                        type="button"
                                        className={theme === 'retro' ? `nes-btn ${isWaitingListOpen ? 'is-success' : ''}` : `${styles.themeToggleBtn} ${isWaitingListOpen ? styles.activeHeaderBtn : ''}`}
                                        style={theme === 'retro' ? { display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 16px', fontSize: '12px', height: '36px', whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap' }}
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
                                    <button
                                        type="button"
                                        className={theme === 'retro' ? `nes-btn ${styles.retroHeaderBtn}` : styles.themeIconBtn}
                                        onClick={() => setIsSettingsOpen(true)}
                                        style={theme === 'retro' ? { width: '36px', height: '36px', fontSize: '16px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' } : undefined}
                                        title={t.settingsTooltip}
                                        aria-label={t.settingsTitle}
                                    >
                                        <Settings size={20} />
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
              <div className={styles.courtGridItem}>
                <AddCourtButton onClick={addCourt} />
              </div>
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
                  {/* + 선수 추가 버튼 */}
                  <button
                    type="button"
                    className={theme === 'retro' ? 'nes-btn is-success' : styles.addPlayerBtn}
                    onClick={() => setIsAddFormOpen(true)}
                    title={t.addPlayerTooltip}
                  >
                    <Plus size={16} />
                  </button>
                  {/* - 전체 삭제 버튼 */}
                  <button
                    type="button"
                    className={theme === 'retro' ? 'nes-btn is-error' : styles.clearPlayerBtn}
                    onClick={() => openConfirm(
                      t.clearAllConfirm,
                      () => clearWaitingList()
                    )}
                    title={t.clearAllTooltip}
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    type="button"
                    className={theme === 'retro' ? 'nes-btn is-warning' : styles.randomBtn}
                    onClick={randomMatch}
                    title={t.randomMatchTooltip}
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

              {/* 슬라이더 래퍼 */}
              {(() => {
                const groups: typeof waitingList[] = [];
                for (let i = 0; i < waitingList.length; i += 4) {
                  groups.push(waitingList.slice(i, i + 4));
                }

                return (
                  <div className={styles.waitingSliderWrapper}>
                    {/* 왼쪽 이동 버튼 */}
                    {isScrollable && (
                      <button
                        type="button"
                        className={`${styles.sliderNavBtn} ${styles.left}`}
                        onClick={scrollPrev}
                        disabled={!canScrollLeft}
                        aria-label="이전"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}

                    {/* 슬라이더 뷰포트 */}
                    <div className={styles.playerListContainer} ref={sliderContainerRef}>
                      <SortableContext items={waitingList.map((p) => p.id)} strategy={rectSortingStrategy}>
                        {waitingList.length > 0 ? (
                          <div className={styles.playerSlideTrack}>
                            {groups.map((group, groupIndex) => (
                              <div
                                key={`group-${groupIndex}`}
                                className={styles.playerGroup}
                              >
                                <div className={styles.groupBadge}>
                                  {theme === 'retro' ? `MATCH ${groupIndex + 1}` : `Match ${groupIndex + 1}`}
                                </div>
                                {group.map((player) => (
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
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.emptyState}>
                            <div className={styles.emptyStateTitle}>{t.emptyWaitingList}</div>
                            <div className={styles.emptyStateDesc}>{t.addPlayerGuide}</div>
                            <div className={styles.emptyStateTip}><b>💡 TIP:</b> {t.addPlayerTip}</div>
                          </div>
                        )}
                      </SortableContext>
                    </div>

                    {/* 오른쪽 이동 버튼 */}
                    {isScrollable && (
                      <button
                        type="button"
                        className={`${styles.sliderNavBtn} ${styles.right}`}
                        onClick={scrollNext}
                        disabled={!canScrollRight}
                        aria-label="다음"
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                );
              })()}
              {/* 선수 추가 폼 (+ 버튼 클릭 시 표시) */}
              {isAddFormOpen && (
                <AddPlayerForm onClose={() => setIsAddFormOpen(false)} />
              )}
            </div>
          </aside>
        </div>
        <DragOverlay adjustScale={true}>
          {activePlayer ? (
            <div style={{ position: 'relative' }}>
              {/* 다중 선택 시 겹쳐 보이는 효과 */}
              {selectedIds.length > 1 && selectedIds.includes(activePlayer.id) ? (
                selectedIds.slice(0, 4).map((id: string, index: number) => {
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

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

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
