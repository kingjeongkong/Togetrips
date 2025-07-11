import '@testing-library/jest-dom';

// fetch mock 추가
global.fetch = jest.fn();

// Supabase 모듈들을 mock으로 대체
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
        admin: {
          listUsers: jest.fn(),
        },
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(),
          download: jest.fn(),
          getPublicUrl: jest.fn(),
        })),
      },
    })),
  };
});

jest.mock('@/lib/supabase-client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      admin: {
        listUsers: jest.fn(),
      },
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));

jest.mock('@/lib/supabase-config', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: {
      admin: {
        listUsers: jest.fn(),
      },
    },
  })),
}));
