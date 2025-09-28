import { create } from 'zustand';

interface RealtimeState {
  totalUnreadMessages: number;
  pendingRequestCount: number;
  setInitialCounts: (messages: number, requests: number) => void;
  incrementMessageCount: () => void;
  decrementMessageCountBy: (amount: number) => void;
  incrementRequestCount: () => void;
  decrementRequestCount: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  totalUnreadMessages: 0,
  pendingRequestCount: 0,

  // 최초 로딩 시 서버의 정확한 값으로 초기화
  setInitialCounts: (messages, requests) =>
    set({ totalUnreadMessages: messages, pendingRequestCount: requests }),

  // 실시간 이벤트에 따라 상태 변경
  incrementMessageCount: () =>
    set((state) => ({ totalUnreadMessages: state.totalUnreadMessages + 1 })),

  decrementMessageCountBy: (amount) =>
    set((state) => ({
      totalUnreadMessages: Math.max(0, state.totalUnreadMessages - amount),
    })),

  incrementRequestCount: () =>
    set((state) => ({ pendingRequestCount: state.pendingRequestCount + 1 })),

  decrementRequestCount: () =>
    set((state) => ({ pendingRequestCount: state.pendingRequestCount - 1 })),
}));
