import { SupabaseClient } from '@supabase/supabase-js';

/**
 * 특정 채팅방의 unread count를 계산하는 공통 서비스 함수
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID
 * @param chatRoomId 채팅방 ID
 * @param fallbackCreatedAt 채팅방 생성 시간 (fallback용)
 * @returns unread count
 */
export async function calculateUnreadCount(
  supabase: SupabaseClient,
  userId: string,
  chatRoomId: string,
  fallbackCreatedAt: string,
): Promise<number> {
  const { data: readStatus } = await supabase
    .from('chat_read_status')
    .select('last_read_at')
    .eq('chat_room_id', chatRoomId)
    .eq('user_id', userId)
    .single();

  const lastReadAt = readStatus?.last_read_at || fallbackCreatedAt;

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('chat_room_id', chatRoomId)
    .neq('sender_id', userId)
    .gt('timestamp', lastReadAt);

  return unreadCount || 0;
}
