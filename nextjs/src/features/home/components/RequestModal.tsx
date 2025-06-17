'use client';

import { useState } from 'react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  receiverName: string;
}

const RequestModal = ({ isOpen, onClose, onSubmit, receiverName }: RequestModalProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="mb-4">
          <span className="text-gray-500">Send Request to</span>
          <span className="text-xl font-semibold ml-2">{receiverName}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-32 p-3 border rounded-xl mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-white bg-orange-500 rounded-xl hover:bg-orange-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
