import { redirect } from 'next/navigation';

export default async function Page() {
  // 루트 페이지 접근 시 홈 페이지로 리다이렉트
  // 인증은 미들웨어에서 처리됨
  redirect('/home');
}
