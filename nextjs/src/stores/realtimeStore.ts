import { create } from 'zustand';

interface RealtimeState {
  messageCount: number;
  requestCount: number;
  activeChatRoomId: string | null;
  setInitialCounts: (messages: number, requests: number) => void;
  incrementMessageCount: () => void;
  decrementMessageCountBy: (amount: number) => void;
  incrementRequestCount: () => void;
  decrementRequestCount: () => void;
  setActiveChatRoomId: (roomId: string | null) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  messageCount: 0,
  requestCount: 0,
  activeChatRoomId: null,

  // 최초 로딩 시 서버의 정확한 값으로 초기화
  setInitialCounts: (messages, requests) => set({ messageCount: messages, requestCount: requests }),

  // 실시간 이벤트에 따라 상태 변경
  incrementMessageCount: () => set((state) => ({ messageCount: state.messageCount + 1 })),

  decrementMessageCountBy: (amount) =>
    set((state) => ({
      messageCount: Math.max(0, state.messageCount - amount),
    })),

  incrementRequestCount: () => set((state) => ({ requestCount: state.requestCount + 1 })),

  decrementRequestCount: () => set((state) => ({ requestCount: state.requestCount - 1 })),

  setActiveChatRoomId: (roomId) => set({ activeChatRoomId: roomId }),
}));
