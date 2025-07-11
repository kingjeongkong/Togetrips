import type { Location } from './profileTypes';

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  tags: string;
  bio: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
}
