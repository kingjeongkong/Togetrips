import ChatRoomHeader from './ChatRoomHeader';
import ChatRoomInput from './ChatRoomInput';
import ChatRoomMessageList from './ChatRoomMessageList';

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
