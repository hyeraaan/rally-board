'use client';

import { useState } from 'react';
import styles from './page.module.css';
import BadmintonCourt from '@/components/BadmintonCourt';
import PlayerMagnet from '@/components/PlayerMagnet';
import AddCourtButton from '@/components/AddCourtButton';
import AddPlayerForm from '@/components/AddPlayerForm';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';

type Tier = 'A' | 'B' | 'C' | 'D' | 'E';
type Player = { id: string; name: string; tier: Tier };

const initialCourts = [
  {
    id: 1,
    players: [
      { id: 'p1', name: 'RM', tier: 'A' as Tier },
      { id: 'p2', name: '진', tier: 'A' as Tier },
      { id: 'p3', name: '슈가', tier: 'B' as Tier },
      { id: 'p4', name: '제이홉', tier: 'B' as Tier },
    ],
  },
  {
    id: 2,
    players: [
      { id: 'p5', name: '지민', tier: 'C' as Tier },
      { id: 'p6', name: '뷔', tier: 'C' as Tier },
    ],
  },
  { id: 3, players: [] as Player[] },
];

const initialWaitingList: Player[] = [
  { id: 'w1', name: '정국', tier: 'A' },
  { id: 'w2', name: '지수', tier: 'B' },
  { id: 'w3', name: '제니', tier: 'A' },
  { id: 'w4', name: '로제', tier: 'C' },
  { id: 'w5', name: '리사', tier: 'D' },
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLanguage();
  const [courts, setCourts] = useState(initialCourts);
  const [waitingList, setWaitingList] = useState<Player[]>(initialWaitingList);

  const addCourt = () => {
    const newId = courts.length > 0 ? Math.max(...courts.map((c) => c.id)) + 1 : 1;
    setCourts((prev) => [...prev, { id: newId, players: [] }]);
  };

  const addPlayer = (name: string, tier: Tier) => {
    const newId = `w${Date.now()}`;
    setWaitingList((prev) => [...prev, { id: newId, name, tier }]);
  };

  return (
    <main className={`${styles.mainContainer} ${theme === 'retro' ? styles.retroMain : ''}`}>
      <div className={styles.contentWrapper}>
        {/* 1. 왼쪽 영역 코트 판 */}
        <section className={styles.courtArea}>
          <div className={styles.titleRow}>
            {/* 타이틀과 버튼 그룹을 양끝으로 배치 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h1 className={styles.areaTitle}>{t.appTitle}</h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={theme === 'retro' ? `nes-btn ${styles.retroFloatBtn}` : styles.floatBtn}
                  onClick={toggleLang}
                  style={{ width: '36px', height: '36px', fontSize: '16px', padding: 0 }}
                  title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
                  aria-label={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
                >
                  {lang === 'ko' ? '🇺🇸' : '🇰🇷'}
                </button>
                <button
                  type="button"
                  className={theme === 'retro' ? `nes-btn ${styles.retroFloatBtn}` : styles.floatBtn}
                  onClick={toggleTheme}
                  style={{ width: '36px', height: '36px', fontSize: '16px', padding: 0 }}
                  title={theme === 'retro' ? '클래식 모드로 전환' : '레트로 모드로 전환'}
                  aria-label={theme === 'retro' ? '클래식 모드로 전환' : '레트로 모드로 전환'}
                >
                  {theme === 'retro' ? '🖥️' : '🕹️'}
                </button>
              </div>
            </div>
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
              {t.waitingList} ({waitingList.length})
            </h2>
          </div>
          <div className={styles.playerListContainer}>
            {waitingList.map((player) => (
              <PlayerMagnet
                key={player.id}
                id={player.id}
                name={player.name}
                tier={player.tier}
              />
            ))}
          </div>
          {/* 선수 추가 폼 (원래대로 하단 배치) */}
          <AddPlayerForm onAdd={addPlayer} />
        </aside>
      </div>
    </main>
  );
}
