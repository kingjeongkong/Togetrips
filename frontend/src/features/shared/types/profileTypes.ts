export interface Location {
  city: string;
  state: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  image: string;
  tags: string;
  bio: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
}

export type EditableProfileFields = Pick<
  UserProfile,
  'name' | 'image' | 'tags' | 'bio'
> & { photoFile?: File };
