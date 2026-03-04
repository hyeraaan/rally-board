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
import { Shuffle, Eraser, Globe, Monitor, Gamepad2, History } from 'lucide-react';

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
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    console.log('--- Drag End Event ---');
    console.log('active:', active);
    console.log('over:', over);
    if (!over) return;

    // active.id: 드래그 중인 선수 ID
    // over.id: 드롭된 영역 ID (코트 id 또는 'waiting-list' 또는 다른 선수 id)
    const activeId = active.id as string;
    const overId = over.id as string | number;

    if (activeId !== overId) {
      if (movePlayer) {
        movePlayer(activeId, overId);
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
          <section className={styles.courtArea}>
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

          {/* 2. 오른쪽 영역 대기 명단 */}
          <aside className={styles.waitingArea} ref={setWaitingListRef}>
            <div className={styles.titleRow}>
              <h2 className={`${styles.areaTitle} ${theme === 'retro' ? 'nes-text is-primary' : ''}`}>
                {t.waitingList} ({waitingList.length})
              </h2>
            </div>
            <div className={styles.playerListContainer}>
              <SortableContext items={waitingList.map((p) => p.id)} strategy={rectSortingStrategy}>
                {waitingList.map((player) => (
                  <PlayerMagnet
                    key={player.id}
                    id={player.id}
                    name={player.name}
                    tier={player.tier}
                    onDelete={deletePlayer}
                    isEditMode={isEditMode}
                  />
                ))}
              </SortableContext>
            </div>
            {/* 선수 추가 폼 (원래대로 하단 배치) */}
            <AddPlayerForm onAdd={addPlayer} />
          </aside>
        </div>
        <DragOverlay>
          {activePlayer ? (
            <PlayerMagnet
              id={activePlayer.id}
              name={activePlayer.name}
              tier={activePlayer.tier}
              isEditMode={isEditMode}
            />
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
