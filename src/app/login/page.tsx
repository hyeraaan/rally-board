'use client';

import { signIn } from 'next-auth/react';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Rally Board</h1>
        <p className={styles.subtitle}>배드민턴 경기 운영 시스템</p>
        
        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className={styles.googleButton}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          구글 계정으로 시작하기
        </button>
        
        <p className={styles.footer}>
          로그인 후 관리자의 승인이 필요합니다.
        </p>
      </div>
    </div>
  );
}
