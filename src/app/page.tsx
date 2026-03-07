'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import BadmintonCourt from '@/components/BadmintonCourt';
import PlayerMagnet from '@/components/PlayerMagnet';
import AddCourtButton from '@/components/AddCourtButton';
import AddPlayerForm from '@/components/AddPlayerForm';
import MatchHistoryModal from '@/components/MatchHistoryModal';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  DndContext, DragEndEvent, DragStartEvent, useDroppable,
  DragOverlay, useSensors, useSensor, PointerSensor, closestCorners
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Shuffle, Eraser, Globe, Monitor, Gamepad2, History, ChevronLeft, ChevronRight } from 'lucide-react';

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
    randomMatch
  } = useBoardStore();

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
        alert("최대 4명까지만 선택 가능합니다.");
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

  if (!isMounted) {
    return <main className={`${styles.mainContainer} ${theme === 'retro' ? styles.retroMain : ''}`} />;
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <h1 className={styles.areaTitle}>{t.appTitle}</h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={theme === 'retro' ? 'nes-btn' : styles.themeToggleBtn}
                    style={theme === 'retro' ? { display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 8px', fontSize: '12px', height: '36px' } : undefined}
                    onClick={randomMatch}
                    title="빈 코트에 인원을 랜덤으로 채웁니다."
                  >
                    <Shuffle size={theme === 'retro' ? 20 : 16} /> {t.randomMatchBtn}
                  </button>
                  <button
                    type="button"
                    className={theme === 'retro' ? 'nes-btn' : styles.themeToggleBtn}
                    style={theme === 'retro' ? { display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 8px', fontSize: '12px', height: '36px' } : undefined}
                    onClick={() => setIsHistoryModalOpen(true)}
                    title="오늘 하루 게임을 진행한 매칭 기록을 확인합니다."
                  >
                    <History size={theme === 'retro' ? 20 : 16} /> {t.historyBtn} ({matchHistory.length})
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
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start', flex: 1, alignContent: 'flex-start' }}>
              {courts.map((court) => (
                <div key={court.id} style={{ flex: '0 0 calc(50% - 12px)', maxWidth: 'calc(50% - 12px)' }}>
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
            {/* 레이어 토글 버튼 */}
            <button
              className={`${styles.sidebarToggle} ${theme === 'retro' ? 'nes-btn' : ''}`}
              onClick={() => setIsWaitingListOpen(!isWaitingListOpen)}
              title={isWaitingListOpen ? "대기명단 닫기" : "대기명단 열기"}
            >
              {isWaitingListOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>

            <div className={styles.sidebarContent}>
              <div className={styles.titleRow}>
                <h2 className={`${styles.areaTitle} ${theme === 'retro' ? 'nes-text is-primary' : ''}`}>
                  {t.waitingList} ({waitingList.length})
                </h2>
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
                        onClick={() => {
                          if (useBoardStore.getState().moveMultiplePlayers) {
                            useBoardStore.getState().moveMultiplePlayers(selectedIds, court.id);
                            setSelectedIds([]);
                          }
                        }}
                      >
                        {court.id}번 코트
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
    </main>
  );
}
