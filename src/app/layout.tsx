import type { Metadata } from 'next';
import { Press_Start_2P, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { LanguageProvider } from '@/providers/LanguageProvider';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start-2p',
  display: 'swap',
}); export const metadata: Metadata = {
  title: '랠리보드 - 배드민턴 자석 보드',
  description: '오프라인 배드민턴 매칭을 위한 디지털 자석 보드',
  icons: {
    icon: '/favicon.ico', // 임시 아이콘, 나중에 변경 가능
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansKR.variable} ${pressStart2P.variable}`}>
          <ThemeProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
