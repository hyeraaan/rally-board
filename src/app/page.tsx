'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './page.module.css';
import BadmintonCourt from '@/components/BadmintonCourt';
import PlayerMagnet from '@/components/PlayerMagnet';
import AddPlayerForm from '@/components/AddPlayerForm';
import MatchHistoryModal from '@/components/MatchHistoryModal';
import ConfirmModal from '@/components/ConfirmModal';
import SettingsModal from '@/components/SettingsModal';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  DndContext, DragEndEvent, DragStartEvent, useDroppable, useDraggable,
  DragOverlay, useSensors, useSensor, PointerSensor, TouchSensor, closestCorners
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import {
  Shuffle, Eraser, Globe, Monitor, Gamepad2, History, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Play, Trophy, Clock, X, Plus, Minus, Settings, GripVertical
} from 'lucide-react';

import { useBoardStore, Player } from '@/store/useBoardStore';

function GroupDragHandle({ id, label }: { id: string, label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      {...attributes} 
      {...listeners} 
      className={`${styles.groupBadge} ${isDragging ? styles.groupDragging : ''}`}
    >
      <GripVertical size={12} />
      {label}
    </div>
  );
}

export default function Home() {
  const { lang, t, toggleLang } = useLanguage();
  const theme = 'classic'; // 테마 고정

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
    activePopoverPlayerId,
    popoverAnchor,
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
    // Math.round를 사용하여 소수점 오차로 인한 판정 누락 방지
    const roundedScrollLeft = Math.round(scrollLeft);
    const roundedMaxScroll = Math.round(scrollWidth - clientWidth);
    
    setCanScrollLeft(roundedScrollLeft > 2); // 2px 임계값
    setCanScrollRight(roundedScrollLeft < roundedMaxScroll - 2); 
  }, []);

  useEffect(() => {
    const el = sliderContainerRef.current;
    if (el) {
      // scroll 리스너는 이제 JSX의 onScroll에서 처리함
      window.addEventListener('resize', handleScroll);
      // 초기 렌더링 이후 레이아웃 확정 시점에 화살표 렌더링
      const timer = setTimeout(handleScroll, 100);
      return () => {
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
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 0.25초 동안 누르고 있어야 드래그 시작 (스크롤 방지)
        tolerance: 5, // 누르고 있는 동안 5px 이상 움직이면 드래그 취소 (실수 방지)
      },
    })
  );

  const { setNodeRef: setWaitingListRef } = useDroppable({
    id: 'waiting-list',
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id.toString();

    if (id.startsWith('group-')) {
      const groupIndex = parseInt(id.split('-')[1]);
      const group = waitingList.slice(groupIndex * 4, groupIndex * 4 + 4);
      if (group.length > 0) {
        const ids = group.map(p => p.id);
        setSelectedIds(ids);
        setActiveId(ids[0]); // 첫 번째 선수를 비주얼 앵커로 설정
      }
    } else {
      setActiveId(id);
      // 드래그한 원소가 선택 목록에 없다면 선택 목록 초기화
      if (!selectedIds.includes(id)) {
        setSelectedIds([]);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeIdVal = active.id.toString();
    const overId = over.id as string | number;

    if (activeIdVal.startsWith('group-')) {
      // 그룹 드래그 처리 (코트로 드롭했을 때만)
      if (typeof overId === 'number' && selectedIds.length > 0) {
        if (useBoardStore.getState().moveMultiplePlayers) {
          useBoardStore.getState().moveMultiplePlayers(selectedIds, overId);
          setSelectedIds([]); // 이동 후 선택 해제
        }
      }
    } else if (activeIdVal !== overId.toString()) {
      // 일반 드래그 처리
      if (typeof overId === 'number' && selectedIds.length > 0 && selectedIds.includes(activeIdVal)) {
        // 다중 이동 (코트로 드롭했을 때만)
        if (useBoardStore.getState().moveMultiplePlayers) {
          useBoardStore.getState().moveMultiplePlayers(selectedIds, overId);
          setSelectedIds([]); // 이동 후 선택 해제
        }
      } else {
        // 단일 이동
        if (movePlayer) {
          movePlayer(activeIdVal, overId);
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
        <main className={styles.mainContainer}>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className={styles.contentWrapper}>
                    {/* 1. 왼쪽 영역 코트 판 */}
                    <section
                        className={`${styles.courtArea} ${isWaitingListOpen ? styles.shifted : ''}`}
                        onClick={(e) => {
                            // 팝오버가 열려있는 경우 배경 클릭 시 닫기
                            if (activePopoverPlayerId) {
                                setActivePopoverPlayerId(null);
                                return;
                            }
                            if (isWaitingListOpen) setIsWaitingListOpen(false);
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
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: '#10b981',
                                            fontWeight: 800,
                                            fontSize: '1.2rem',
                                        }}>
                                            <Clock size={20} />
                                            {eventTime}
                                        </div>
                                    {isEventRunning ? (
                                        <button
                                            type="button"
                                            className={styles.themeToggleBtn}
                                            style={{ backgroundColor: '#ef4444', color: 'white' }}
                                            onClick={handleEndTournament}
                                            title={t.endTournamentTooltip}
                                        >
                                            <Trophy size={16} fill="white" /> {t.tournamentEnd}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.themeToggleBtn}
                                            style={{ backgroundColor: '#10b981', color: 'white', whiteSpace: 'nowrap' }}
                                            onClick={handleStartTournament}
                                            title={t.startTournamentTooltip}
                                        >
                                            <Play size={16} fill="white" /> {t.tournamentStart}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.themeToggleBtn}
                                        style={{ whiteSpace: 'nowrap' }}
                                        onClick={() => setIsHistoryModalOpen(true)}
                                        title={t.historyTooltip}
                                    >
                                        <History size={16} /> {t.historyBtn} ({matchHistory.length})
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.themeToggleBtn} ${isWaitingListOpen ? styles.activeHeaderBtn : ''}`}
                                        style={{ whiteSpace: 'nowrap' }}
                                        onClick={() => setIsWaitingListOpen(!isWaitingListOpen)}
                                        title={isWaitingListOpen ? t.closeWaitingListTooltip : t.openWaitingListTooltip}
                                    >
                                        <Monitor size={16} /> {t.waitingList}
                                    </button>
                                     <button
                                         type="button"
                                         className={styles.themeToggleBtn}
                                         style={{ whiteSpace: "nowrap" }}
                                         onClick={addCourt}
                                         title="코트 추가"
                                     >
                                         <Plus size={16} /> 코트 추가
                                     </button>
                                    <button
                                        type="button"
                                        className={`${styles.themeIconBtn} ${isEditMode ? styles.editActiveBtn : ''}`}
                                        onClick={toggleEditMode}
                                        title="선수 삭제 모드"
                                        aria-label="선수 삭제 모드"
                                    >
                                        <Eraser size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.themeIconBtn}
                                        onClick={toggleLang}
                                        title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
                                        aria-label={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
                                    >
                                        <Globe size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.themeIconBtn}
                                        onClick={() => setIsSettingsOpen(true)}
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
            </div>
          </section>

          {/* 2. 오른쪽 영역 대기 명단 (사이드바 레이어) */}
          <aside className={`${styles.waitingArea} ${isWaitingListOpen ? styles.isOpen : ''}`} ref={setWaitingListRef}>
            <div className={styles.sidebarContent}>
              <div className={styles.sidebarHeader}>
                <h2 className={styles.areaTitle}>
                  {t.waitingList} ({waitingList.length})
                </h2>
                <div className={styles.sidebarButtonGroup}>
                  {/* + 선수 추가 버튼 */}
                  <button
                    type="button"
                    className={styles.addPlayerBtn}
                    onClick={() => setIsAddFormOpen(true)}
                    title={t.addPlayerTooltip}
                  >
                    <Plus size={16} />
                  </button>
                  {/* - 전체 삭제 버튼 */}
                  <button
                    type="button"
                    className={styles.clearPlayerBtn}
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
                    className={styles.randomBtn}
                    onClick={randomMatch}
                    title={t.randomMatchTooltip}
                  >
                    <Shuffle size={16} /> {t.randomMatchBtn}
                  </button>
                </div>
              </div>



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
                    <div className={styles.playerListContainer} ref={sliderContainerRef} onScroll={handleScroll}>
                      <SortableContext items={waitingList.map((p) => p.id)} strategy={rectSortingStrategy}>
                        {waitingList.length > 0 ? (
                          <div className={styles.playerSlideTrack}>
                            {groups.map((group, groupIndex) => (
                              <div
                                key={`group-${groupIndex}`}
                                className={styles.playerGroup}
                              >
                                <GroupDragHandle 
                                  id={`group-${groupIndex}`} 
                                  label={`Match ${groupIndex + 1}`} 
                                />
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
          {activeId && activePlayer ? (
            <div style={{ position: 'relative', zIndex: 2000 }}>
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
              style={{
                fontSize: '12rem',
                fontWeight: 900,
                color: '#f59e0b',
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
      {/* 플로팅 버튼 그룹 (하단 중앙) */}
      <div className={`${styles.floatingBtns} ${isWaitingListOpen ? styles.shiftedUp : ''}`}>
        <button
          type="button"
          className={`${styles.floatBtn} ${isWaitingListOpen ? styles.activeFloatBtn : ''}`}
          onClick={() => setIsWaitingListOpen(!isWaitingListOpen)}
          title={isWaitingListOpen ? t.closeWaitingListTooltip : t.openWaitingListTooltip}
          aria-label={isWaitingListOpen ? t.closeWaitingListTooltip : t.openWaitingListTooltip}
        >
          {isWaitingListOpen ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </button>
      </div>

      {/* 전역 코트 선택 팝오버 (클리핑 방지용 fixed 레이어) */}
      {activePopoverPlayerId && popoverAnchor && (
        <div 
          className={styles.globalCourtPopover} 
          style={{ 
            position: 'fixed',
            left: `${popoverAnchor.x}px`,
            top: `${popoverAnchor.y}px`, // 앵커(네임택 상단) 위치에 직접 배치
            width: `${popoverAnchor.width}px`, // 네임택 너비와 동기화
            transform: 'translate(-50%, 0)', // 상단 기준 정렬 (네임택을 덮음)
            zIndex: 2001
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.popoverHeader}>
            <button className={styles.popoverClose} onClick={() => setActivePopoverPlayerId(null)}>×</button>
          </div>
          <div className={styles.courtButtons}>
            {courts.map((court) => (
              <button
                key={court.id}
                className={`${styles.courtBtn} ${court.players.length >= 4 ? styles.disabled : ''}`}
                onClick={() => {
                  if (court.players.length < 4) {
                    movePlayer(activePopoverPlayerId, court.id);
                    setActivePopoverPlayerId(null);
                  }
                }}
                disabled={court.players.length >= 4}
              >
                {court.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 코트 선택 전역 백드롭 */}
      {activePopoverPlayerId && (
        <div 
          className={styles.popoverGlobalBackdrop} 
          onClick={() => setActivePopoverPlayerId(null)}
        />
      )}
    </main>
  );
}
