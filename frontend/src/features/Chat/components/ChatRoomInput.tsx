import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';

interface ChatRoomInputProps {
  onSendMessage: (message: string) => void;
}

const ChatRoomInput = ({ onSendMessage }: ChatRoomInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-300 px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMessage(e.target.value)
          }
          className="flex-1 rounded-full px-4 py-2 bg-white"
        ></input>
        <button
          type="submit"
          disabled={!message}
          className={`p-2 rounded-full ${
            message
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <IoSend size={24} />
        </button>
      </form>
    </div>
  );
};

export default ChatRoomInput;
