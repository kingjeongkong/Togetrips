import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);
  // 로그인 여부와 상관없이 무조건 로그인 페이지로 리다이렉트
  // TODO: 로그인 여부에 따라 다른 페이지로 리다이렉트 (ex. 홈 화면)
  redirect('/auth/signin');
}
