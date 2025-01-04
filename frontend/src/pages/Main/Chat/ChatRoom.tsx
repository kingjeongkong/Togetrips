import ChatRoomHeader from '../../../features/Main/section/Chat/components/ChatRoomHeader';
import ChatRoomInput from '../../../features/Main/section/Chat/components/ChatRoomInput';
import ChatRoomMessageList from '../../../features/Main/section/Chat/components/ChatRoomMessageList';

const ChatRoom = () => {
  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatRoomHeader profileImage="https://via.placeholder.com/150" name="John Doe" />
      <ChatRoomMessageList />
      <ChatRoomInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
