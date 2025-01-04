import ChatRoomHeader from '../../../features/Main/section/Chat/components/ChatRoomHeader';
import ChatRoomInput from '../../../features/Main/section/Chat/components/ChatRoomInput';

const ChatRoom = () => {
  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatRoomHeader profileImage="https://via.placeholder.com/150" name="John Doe" />
      <div className="flex-1 bg-green-300">Message Area</div>
      <ChatRoomInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
