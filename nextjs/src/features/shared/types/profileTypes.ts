import type { User } from './User';

export type UserProfile = User;

export type EditableProfileFields = Pick<User, 'name' | 'image' | 'tags' | 'bio'> & {
  photoFile?: File;
};
