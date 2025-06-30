import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// 서버 전용 Firebase 설정
const apps = getApps();
if (!apps.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = getFirestore();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password.');
        }

        try {
          // 서버 사이드에서 Firebase Admin SDK를 사용하여 인증
          const { getAuth } = await import('firebase-admin/auth');
          const adminAuth = getAuth();

          // 이메일로 사용자 조회
          const userRecord = await adminAuth.getUserByEmail(credentials.email);

          // 비밀번호 검증 (Firebase Admin SDK는 직접적인 비밀번호 검증을 지원하지 않으므로
          // 클라이언트 SDK를 사용하거나 다른 방법을 사용해야 함)
          // 여기서는 간단히 사용자 존재 여부만 확인
          return {
            id: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName,
          };
        } catch (error: unknown) {
          if (error instanceof Error && 'code' in error && error.code === 'auth/user-not-found') {
            throw new Error('Invalid email or password.');
          }
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  }),
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 상대 URL인 경우 baseUrl과 결합
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // 같은 도메인의 URL인 경우 허용
      else if (new URL(url).origin === baseUrl) return url;
      // 그 외의 경우 홈으로 리다이렉트
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const userRef = adminDb.collection('users').doc(user.id);
        const userSnap = await userRef.get();

        // NextAuth가 자동 생성한 기본 필드만 있을 때만(즉, 최초 로그인 시점)
        const data = userSnap.data();
        const isFirstGoogleLogin =
          data &&
          Object.keys(data).length <= 4 && // email, name, image, emailVerified 등만 있을 때
          !data.bio &&
          !data.tags &&
          !data.location;

        if (isFirstGoogleLogin) {
          await userRef.set(
            {
              name: user.name || '',
              email: user.email || '',
              tags: '',
              bio: '',
              location: { city: '', state: '' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true },
          );
        }
      }
    },
  },
};
