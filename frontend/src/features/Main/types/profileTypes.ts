export interface Location {
  city: string;
  state: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  tags: string;
  bio: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
}

export type EditableProfileFields = Pick<
  UserProfile,
  'name' | 'photoURL' | 'tags' | 'bio'
> & { photoFile?: File };
