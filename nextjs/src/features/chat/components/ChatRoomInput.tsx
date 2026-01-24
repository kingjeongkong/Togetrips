'use client';

import { KeyboardEvent, useEffect, useRef, useState } from 'react';

interface ChatRoomInputProps {
  onSendMessage: (message: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const ChatRoomInput = ({ onSendMessage, onFocus, onBlur }: ChatRoomInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // iOS Safari에서 키보드가 올라올 때 스크롤을 (0, 0)으로 강제하여
  // 뷰포트가 올바르게 정렬되도록 하는 트릭입니다.
  const handleFocus = () => {
    // 딜레이를 약간 주면 더 안정적으로 작동합니다.
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  return (
    <div className="flex-shrink-0 bg-gray-100 border-t border-gray-200 p-4">
      <div className="flex items-end">
        <textarea
          ref={textareaRef}
          id="chat-message-input"
          aria-label="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            handleFocus();
            onFocus();
          }}
          onBlur={onBlur}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none overflow-y-auto min-h-[40px] max-h-[100px] dark:text-black"
          style={{ lineHeight: '1.4' }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="ml-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed h-[40px]"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoomInput;
