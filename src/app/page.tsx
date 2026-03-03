'use client';

import { useState } from 'react';
import styles from './page.module.css';
import BadmintonCourt from '@/components/BadmintonCourt';
import PlayerMagnet from '@/components/PlayerMagnet';
import AddCourtButton from '@/components/AddCourtButton';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';

// 초기 코트 데이터
const initialCourts = [
  {
    id: 1,
    players: [
      { id: 'p1', name: 'RM', tier: 'A' },
      { id: 'p2', name: '진', tier: 'A' },
      { id: 'p3', name: '슈가', tier: 'B' },
      { id: 'p4', name: '제이홉', tier: 'B' },
    ] as any,
  },
  {
    id: 2,
    players: [
      { id: 'p5', name: '지민', tier: 'C' },
      { id: 'p6', name: '뷔', tier: 'C' },
    ] as any,
  },
  {
    id: 3,
    players: [] as any,
  },
];

const mockWaitingList = [
  { id: 'w1', name: '정국', tier: 'A' },
  { id: 'w2', name: '지수', tier: 'B' },
  { id: 'w3', name: '제니', tier: 'A' },
  { id: 'w4', name: '로제', tier: 'C' },
  { id: 'w5', name: '리사', tier: 'D' },
] as any;

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLanguage();
  const [courts, setCourts] = useState(initialCourts);

  const addCourt = () => {
    const newId = courts.length > 0 ? Math.max(...courts.map((c) => c.id)) + 1 : 1;
    setCourts((prev) => [...prev, { id: newId, players: [] }]);
  };

  return (
    <main className={`${styles.mainContainer} ${theme === 'retro' ? styles.retroMain : ''}`}>
      <div className={styles.contentWrapper}>
        {/* 1. 왼쪽 영역 코트 판 */}
        <section className={styles.courtArea}>
          <div className={styles.titleRow}>
            <h1 className={styles.areaTitle}>{t.appTitle}</h1>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {courts.map((court) => (
              <div key={court.id} style={{ flex: '1 1 400px', maxWidth: '500px' }}>
                <BadmintonCourt courtNumber={court.id} players={court.players} />
              </div>
            ))}
            <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
              <AddCourtButton onClick={addCourt} />
            </div>
          </div>
        </section>

        {/* 2. 오른쪽 영역 대기 명단 */}
        <aside className={styles.waitingArea}>
          <div className={styles.titleRow}>
            <h2 className={`${styles.areaTitle} ${theme === 'retro' ? 'nes-text is-primary' : ''}`}>
              {t.waitingList} ({mockWaitingList.length})
            </h2>
          </div>
          <div className={styles.playerListContainer}>
            {mockWaitingList.map((player: any) => (
              <PlayerMagnet
                key={player.id}
                id={player.id}
                name={player.name}
                tier={player.tier}
              />
            ))}
          </div>
        </aside>
      </div>

      {/* 오른쪽 하단 고정 플로팅 버튼 */}
      <div className={`${styles.floatingBtns} ${theme === 'retro' ? styles.retroFloating : ''}`}>
        <button
          type="button"
          className={theme === 'retro' ? `nes-btn ${styles.retroFloatBtn}` : styles.floatBtn}
          onClick={toggleLang}
          title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
          aria-label={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
        >
          {lang === 'ko' ? '🇺🇸' : '🇰🇷'}
        </button>
        <button
          type="button"
          className={theme === 'retro' ? `nes-btn ${styles.retroFloatBtn}` : styles.floatBtn}
          onClick={toggleTheme}
          title={theme === 'retro' ? '클래식 모드로 전환' : '레트로 모드로 전환'}
          aria-label={theme === 'retro' ? '클래식 모드로 전환' : '레트로 모드로 전환'}
        >
          {theme === 'retro' ? '🖥️' : '🕹️'}
        </button>
      </div>
    </main>
  );
}
