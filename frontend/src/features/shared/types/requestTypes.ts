import { UserProfile } from './profileTypes';

export interface Request {
  id: string;
  senderID: string;
  receiverID: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: string;
}

export type RequestUserProfile = Pick<
  UserProfile,
  'name' | 'photoURL' | 'tags' | 'location'
>;
