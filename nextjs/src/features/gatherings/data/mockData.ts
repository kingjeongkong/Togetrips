import { GatheringWithDetails } from '../types/gatheringTypes';

export const mockGatherings: GatheringWithDetails[] = [
  {
    id: '1',
    host_id: 'user1',
    activity_title: 'Morning Coffee & City Walk',
    description:
      "Join us for a relaxing morning coffee followed by a leisurely walk through the historic downtown area. We'll explore local cafes, street art, and hidden gems while getting to know each other.",
    gathering_time: '2024-01-15T09:00:00Z',
    location_id: 'place.1234567890',
    city: 'Seoul',
    country: 'South Korea',
    max_participants: 6,
    participants: ['user1', 'user2', 'user3'],
    cover_image_url:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    host: {
      id: 'user1',
      name: 'Sarah Kim',
      image:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    participant_count: 3,
    is_joined: false,
    is_host: false,
    is_full: false,
    participant_details: [
      {
        id: 'user1',
        name: 'Sarah Kim',
        image:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user2',
        name: 'Mike Johnson',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user3',
        name: 'Emma Wilson',
        image:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
  {
    id: '2',
    host_id: 'user4',
    activity_title: 'Photography Workshop',
    description:
      "Learn the basics of street photography with professional photographer Alex. We'll cover composition, lighting, and editing techniques while exploring the city's most photogenic spots.",
    gathering_time: '2024-01-16T14:00:00Z',
    location_id: 'place.2345678901',
    city: 'Tokyo',
    country: 'Japan',
    max_participants: 8,
    participants: ['user4', 'user5', 'user6', 'user7'],
    cover_image_url:
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=400&fit=crop',
    created_at: '2024-01-11T08:00:00Z',
    updated_at: '2024-01-11T08:00:00Z',
    host: {
      id: 'user4',
      name: 'Alex Chen',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    participant_count: 4,
    is_joined: true,
    is_host: false,
    is_full: false,
    participant_details: [
      {
        id: 'user4',
        name: 'Alex Chen',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user5',
        name: 'Lisa Park',
        image:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user6',
        name: 'David Lee',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user7',
        name: 'Anna Smith',
        image:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
  {
    id: '3',
    host_id: 'user8',
    activity_title: 'Food Tour Adventure',
    description:
      "Discover the best local street food and hidden restaurants in the city. We'll visit 5 different locations, trying authentic dishes and learning about the local food culture.",
    gathering_time: '2024-01-17T18:00:00Z',
    location_id: 'place.3456789012',
    city: 'Bangkok',
    country: 'Thailand',
    max_participants: 4,
    participants: ['user8'],
    cover_image_url:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
    created_at: '2024-01-12T12:00:00Z',
    updated_at: '2024-01-12T12:00:00Z',
    host: {
      id: 'user8',
      name: 'Tom Wilson',
      image:
        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
    },
    participant_count: 1,
    is_joined: false,
    is_host: true,
    is_full: false,
    participant_details: [
      {
        id: 'user8',
        name: 'Tom Wilson',
        image:
          'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
  {
    id: '4',
    host_id: 'user9',
    activity_title: 'Sunset Yoga Session',
    description:
      "Join us for a peaceful yoga session as the sun sets over the city skyline. All levels welcome! We'll provide mats and have a certified instructor leading the session.",
    gathering_time: '2024-01-18T17:30:00Z',
    location_id: 'place.4567890123',
    city: 'Barcelona',
    country: 'Spain',
    max_participants: 12,
    participants: [
      'user9',
      'user10',
      'user11',
      'user12',
      'user13',
      'user14',
      'user15',
      'user16',
      'user17',
      'user18',
      'user19',
      'user20',
    ],
    cover_image_url:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop',
    created_at: '2024-01-13T09:00:00Z',
    updated_at: '2024-01-13T09:00:00Z',
    host: {
      id: 'user9',
      name: 'Maria Garcia',
      image:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    },
    participant_count: 12,
    is_joined: false,
    is_host: false,
    is_full: true,
    participant_details: [
      {
        id: 'user9',
        name: 'Maria Garcia',
        image:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user10',
        name: 'James Brown',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user11',
        name: 'Sophie Martin',
        image:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user12',
        name: 'John Doe',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user13',
        name: 'Jane Doe',
        image:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user14',
        name: 'John Smith',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user15',
        name: 'Jane Smith',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user16',
        name: 'John Doe',
        image:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user17',
        name: 'Jane Doe',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user18',
        name: 'John Smith',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user19',
        name: 'Jane Smith',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user6',
        name: 'David Lee',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
  {
    id: '5',
    host_id: 'user21',
    activity_title: 'Language Exchange Meetup',
    description:
      "Practice your language skills with native speakers! We'll have tables for different languages including English, Spanish, French, and Korean. Bring your enthusiasm and a willingness to help others learn.",
    gathering_time: '2024-01-19T19:00:00Z',
    location_id: 'place.5678901234',
    city: 'Paris',
    country: 'France',
    max_participants: 15,
    participants: ['user21', 'user22', 'user23'],
    cover_image_url:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
    created_at: '2024-01-14T11:00:00Z',
    updated_at: '2024-01-14T11:00:00Z',
    host: {
      id: 'user21',
      name: 'Pierre Dubois',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    participant_count: 3,
    is_joined: false,
    is_host: false,
    is_full: false,
    participant_details: [
      {
        id: 'user21',
        name: 'Pierre Dubois',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user22',
        name: 'Yuki Tanaka',
        image:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user23',
        name: 'Carlos Rodriguez',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
  {
    id: '6',
    host_id: 'user24',
    activity_title: 'Hiking & Nature Photography',
    description:
      "Explore the beautiful mountain trails while capturing stunning nature photos. We'll hike for about 3 hours with breaks for photography and snacks. Moderate fitness level required.",
    gathering_time: '2024-01-20T07:00:00Z',
    location_id: 'place.6789012345',
    city: 'Vancouver',
    country: 'Canada',
    max_participants: 6,
    participants: ['user24', 'user25'],
    cover_image_url:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z',
    host: {
      id: 'user24',
      name: 'Jennifer Adams',
      image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    },
    participant_count: 2,
    is_joined: false,
    is_host: false,
    is_full: false,
    participant_details: [
      {
        id: 'user24',
        name: 'Jennifer Adams',
        image:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'user25',
        name: 'Robert Kim',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
];
