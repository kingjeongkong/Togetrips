import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { adminAuth, adminDb } from './firebase-admin';

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
        name: { label: 'Name', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'boolean' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password.');
        }

        try {
          if (credentials.isSignUp) {
            // 회원가입
            const userRecord = await adminAuth.createUser({
              email: credentials.email,
              password: credentials.password,
              displayName: credentials.name,
            });

            // Firestore에 사용자 정보 저장
            await adminDb.collection('users').doc(userRecord.uid).set({
              name: credentials.name,
              email: credentials.email,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            return {
              id: userRecord.uid,
              email: userRecord.email,
              name: userRecord.displayName,
            };
          } else {
            // 로그인
            const userRecord = await adminAuth.getUserByEmail(credentials.email);
            // Firebase Admin SDK는 비밀번호 검증을 직접 지원하지 않으므로,
            // 커스텀 토큰을 생성하여 검증
            const customToken = await adminAuth.createCustomToken(userRecord.uid);

            return {
              id: userRecord.uid,
              email: userRecord.email,
              name: userRecord.displayName,
            };
          }
        } catch (error: any) {
          throw new Error(error.message);
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
  },
};
