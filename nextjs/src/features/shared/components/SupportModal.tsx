'use client';

import { useState } from 'react';
import { BsFillLightbulbFill } from 'react-icons/bs';
import { FiAlertCircle, FiHelpCircle, FiSend, FiX } from 'react-icons/fi';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SupportType = 'bug' | 'feature' | 'general';

const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const [supportType, setSupportType] = useState<SupportType>('general');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');

  // 폼 제출 핸들러 (아직 실제 제출 기능은 구현되지 않음)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 추후 제출 기능 구현 예정
    console.log('Support form submitted:', { supportType, subject, description, email });
    onClose();
  };

  // 지원 유형에 따라 아이콘 반환 (feature는 아이콘 없음)
  const getTypeIcon = (type: SupportType) => {
    switch (type) {
      case 'bug':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case 'feature':
        return <BsFillLightbulbFill className="w-5 h-5 text-yellow-500" />;
      case 'general':
        return <FiHelpCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  // 지원 유형에 따라 라벨 반환
  const getTypeLabel = (type: SupportType) => {
    switch (type) {
      case 'bug':
        return 'Bug Report';
      case 'feature':
        return 'Feature Request';
      case 'general':
        return 'General Question';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type of Request</label>
            <div className="grid grid-cols-3 gap-2">
              {(['bug', 'feature', 'general'] as SupportType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSupportType(type)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    supportType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {getTypeIcon(type)}
                  <span className="text-xs mt-1 font-medium">{getTypeLabel(type)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of your request"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Please provide detailed information about your request..."
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll use this to follow up on your request if needed
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiSend className="w-4 h-4" />
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportModal;
