import type { User } from './User';

export interface Request {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: string;
}

export type RequestUserProfile = Pick<User, 'name' | 'image' | 'tags' | 'location'>;
