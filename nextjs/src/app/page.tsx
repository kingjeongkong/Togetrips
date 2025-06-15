import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // 로그인 안 했으면 로그인 페이지로 리다이렉트
    redirect('/auth/signin');
  }

  // 로그인 했으면 홈(메인) 페이지로 리다이렉트
  redirect('/home');
}
