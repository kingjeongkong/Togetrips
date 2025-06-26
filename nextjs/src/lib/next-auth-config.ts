import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { auth, db } from './firebase-config';

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
          // 로그인 - Firebase 클라이언트 SDK를 사용하여 비밀번호 검증
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password,
          );

          return {
            id: userCredential.user.uid,
            email: userCredential.user.email,
            name: userCredential.user.displayName,
          };
        } catch (error: any) {
          if (error.code === 'auth/invalid-credential') {
            throw new Error('Invalid email or password.');
          }
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
  events: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);

        // NextAuth가 자동 생성한 기본 필드만 있을 때만(즉, 최초 로그인 시점)
        const data = userSnap.data();
        const isFirstGoogleLogin =
          data &&
          Object.keys(data).length <= 4 && // email, name, image, emailVerified 등만 있을 때
          !data.bio &&
          !data.tags &&
          !data.location;

        if (isFirstGoogleLogin) {
          await setDoc(
            userRef,
            {
              name: user.name || '',
              email: user.email || '',
              photoURL: user.image || '',
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
