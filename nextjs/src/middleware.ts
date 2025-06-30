import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});

export const config = {
  matcher: [
    '/home/:path*',
    '/request/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/api/users/:path*',
    '/api/profile/:path*',
    '/api/request/:path*',
    '/api/chat/:path*',
  ],
};
