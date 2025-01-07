import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../features/Main/components/Sidebar';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import ChatList from '../../features/Main/section/Chat/components/ChatList';

const ChatLayout = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  const isRootPath = location.pathname === '/chat';

  if (isMobile) {
    // ------ (A) 모바일 레이아웃 ------
    return (
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Sidebar />
        <main className="flex-1">
          {/* 모바일에서는 <Outlet /> 안에서 index이면 ChatList, :chatId이면 ChatRoom */}
          <Outlet />
        </main>
      </div>
    );
  } else {
    // ------ (B) 데스크톱 레이아웃 ------
    // 데스크톱은 2컬럼: 왼쪽(채팅 목록), 오른쪽(채팅 상세 or 빈 화면)
    // ChatList 중복 방지를 위해, 오른쪽 컬럼에서는 “/:chatId”일 때만 <Outlet />을 보여주도록 처리.

    const hasChatId = !isRootPath; // /chat/:chatId면 true, /chat이면 false

    return (
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Sidebar />
        <main className="flex flex-1 pl-60">
          {/* 직접 ChatList를 렌더링 */}
          <div className="border-r border-gray-300 w-[350px]">
            <ChatList />
          </div>

          {/* 오른쪽 영역: /chat/:chatId 일 때만 <Outlet /> (ChatRoom) 표시 */}
          {hasChatId ? (
            <div className="flex-1">
              <Outlet />
            </div>
          ) : (
            // /chat(루트)면 아무 채팅방도 선택 안 된 상태이므로, ChatRoom 안띄움
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500">Select a chat.</div>
            </div>
          )}
        </main>
      </div>
    );
  }
};

export default ChatLayout;
