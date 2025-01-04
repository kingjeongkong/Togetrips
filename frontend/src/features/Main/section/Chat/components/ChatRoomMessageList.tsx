import ChatRoomMessage from "./ChatRoomMessage";

interface Message {
    id: number;
    text: string;
    time: string;
    isMine: boolean;
}

const ChatRoomMessageList = () => {
    const messages: Message[] = [
        {
          id: 1,
          text: "Hi! I'm planning to visit Seoul next week.",
          time: '10:00',
          isMine: false
        },
        {
          id: 2,
          text: 'That\'s great! I can recommend some good places to visit.',
          time: '10:01',
          isMine: true
        },
        {
          id: 3,
          text: 'I\'m interested in trying local food and visiting historical places.',
          time: '10:02',
          isMine: false
        },
        {
          id: 4,
          text: 'For historical places, you should definitely visit Gyeongbokgung Palace. And for local food, there\'s this amazing restaurant in Hongdae...',
          time: '10:03',
          isMine: true
        },
        {
            id: 1,
            text: "Hi! I'm planning to visit Seoul next week.",
            time: '10:00',
            isMine: false
          },
          {
            id: 2,
            text: 'That\'s great! I can recommend some good places to visit.',
            time: '10:01',
            isMine: true
          },
          {
            id: 3,
            text: 'I\'m interested in trying local food and visiting historical places.',
            time: '10:02',
            isMine: false
          },
          {
            id: 4,
            text: 'For historical places, you should definitely visit Gyeongbokgung Palace. And for local food, there\'s this amazing restaurant in Hongdae...',
            time: '10:03',
            isMine: true
          },
          {
            id: 1,
            text: "Hi! I'm planning to visit Seoul next week.",
            time: '10:00',
            isMine: false
          },
          {
            id: 2,
            text: 'That\'s great! I can recommend some good places to visit.',
            time: '10:01',
            isMine: true
          },
          {
            id: 3,
            text: 'I\'m interested in trying local food and visiting historical places.',
            time: '10:02',
            isMine: false
          },
          {
            id: 4,
            text: 'For historical places, you should definitely visit Gyeongbokgung Palace. And for local food, there\'s this amazing restaurant in Hongdae...',
            time: '10:03',
            isMine: true
          },
          {
            id: 1,
            text: "Hi! I'm planning to visit Seoul next week.",
            time: '10:00',
            isMine: false
          },
          {
            id: 2,
            text: 'That\'s great! I can recommend some good places to visit.',
            time: '10:01',
            isMine: true
          },
          {
            id: 3,
            text: 'I\'m interested in trying local food and visiting historical places.',
            time: '10:02',
            isMine: false
          },
          {
            id: 4,
            text: 'For historical places, you should definitely visit Gyeongbokgung Palace. And for local food, there\'s this amazing restaurant in Hongdae...',
            time: '10:03',
            isMine: true
          },
      ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-200">
        {messages.map((message) => (
            <ChatRoomMessage key={message.id} {...message} />
        ))}
    </div>
  )
};

export default ChatRoomMessageList;
