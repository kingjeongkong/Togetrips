export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  tags: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export type EditableProfileFields = Pick<
  UserProfile,
  'name' | 'photoURL' | 'tags' | 'bio'
>;
