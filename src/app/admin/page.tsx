import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";
import styles from './page.module.css';

export default async function AdminPage() {
  const session = await auth();

  // 관리자 검증
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  // 전체 사용자 프로필 가져오기
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <h1>사용자 승인 관리</h1>
        <p>서비스 이용을 신청한 사용자 목록입니다.</p>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>사용자</th>
              <th>이메일</th>
              <th>상태</th>
              <th>최근 접속</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => (
              <tr key={profile.id}>
                <td>
                  <div className={styles.userInfo}>
                    {profile.avatar_url && <img src={profile.avatar_url} alt="" className={styles.avatar} />}
                    <span>{profile.full_name || '이름 없음'}</span>
                  </div>
                </td>
                <td>{profile.email}</td>
                <td>
                  <span className={profile.is_approved ? styles.statusApproved : styles.statusPending}>
                    {profile.is_approved ? '승인됨' : '대기 중'}
                  </span>
                </td>
                <td>{new Date(profile.updated_at).toLocaleString()}</td>
                <td>
                  <form action={async () => {
                    'use server';
                    // 승인 상태 토글 로직
                    await supabaseAdmin
                      .from('profiles')
                      .update({ is_approved: !profile.is_approved })
                      .eq('id', profile.id);
                  }}>
                    <button className={styles.actionButton}>
                      {profile.is_approved ? '승인 취소' : '승인하기'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className={styles.footer}>
        <a href="/">홈으로 돌아가기</a>
      </div>
    </div>
  );
}
