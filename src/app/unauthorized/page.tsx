import styles from './page.module.css';

export default function UnauthorizedPage() {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.icon}>🔓</div>
        <h1 className={styles.title}>승인 대기 중</h1>
        <p className={styles.message}>
          계정 등록이 완료되었습니다.<br />
          관리자가 승인한 후에 서비스를 이용하실 수 있습니다.
        </p>
        <p className={styles.hint}>
          잠시 후 다시 시도해 주시거나 관리자에게 문의하세요.
        </p>
        <a href="/api/auth/signout" className={styles.link}>로그아웃</a>
      </div>
    </div>
  );
}
