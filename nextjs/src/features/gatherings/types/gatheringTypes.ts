export interface Gathering {
  id: string;
  host_id: string;
  activity_title: string;
  description: string;
  gathering_time: string;
  location_id: string;
  city: string;
  country: string;
  max_participants: number;
  participants: string[];
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GatheringWithDetails extends Gathering {
  host: {
    id: string;
    name: string;
    image: string;
  };
  participant_count: number;
  is_joined: boolean;
  is_host: boolean;
  is_full: boolean;
}

export interface CreateGatheringRequest {
  activity_title: string;
  description: string;
  gathering_time: string;
  location_id: string;
  city: string;
  country: string;
  max_participants: number;
  cover_image_url?: string;
}

export interface UpdateGatheringRequest extends Partial<CreateGatheringRequest> {
  id: string;
}

export interface JoinGatheringRequest {
  gathering_id: string;
}

export interface LeaveGatheringRequest {
  gathering_id: string;
}

// API 응답 타입들
export interface GatheringsListResponse {
  gatherings: GatheringWithDetails[];
}

export interface GatheringDetailResponse {
  gathering: GatheringWithDetails & {
    host: {
      id: string;
      name: string;
      image: string;
      location: {
        city: string;
        country: string;
      };
    };
  };
}

export interface CreateGatheringResponse {
  gathering: Gathering;
  message: string;
}

export interface JoinGatheringResponse {
  success: boolean;
  message: string;
}

export interface LeaveGatheringResponse {
  success: boolean;
  message: string;
}
