import type { User } from './User';

export interface Location {
  city: string;
  state: string;
}

export type UserProfile = User;

export type EditableProfileFields = Pick<User, 'name' | 'image' | 'tags' | 'bio'> & {
  photoFile?: File;
};
