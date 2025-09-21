import { isGoogleMapsLoaded, loadGoogleMapsIfNeeded } from '@/lib/google-maps';
import { ProfileOverlay } from '@/lib/ProfileOverlay';
import { create } from 'zustand';

interface MapStore {
  // 상태
  map: google.maps.Map | null;
  isMapLoaded: boolean;
  overlays: ProfileOverlay[];
  currentContainerId: string | null;
  isInitializing: boolean;

  // 액션
  initializeMap: () => Promise<void>;
  updateMapCenter: (lat: number, lng: number) => void;
  clearOverlays: () => void;
  addProfileOverlay: (
    lat: number,
    lng: number,
    imageUrl: string,
    name: string,
    isCurrentUser?: boolean,
  ) => void;
  showMap: (containerId: string) => void;
  hideMap: () => void;
  reset: () => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  // 초기 상태
  map: null,
  isMapLoaded: false,
  overlays: [],
  currentContainerId: null,
  isInitializing: false,

  // 지도 초기화
  initializeMap: async () => {
    const { isInitializing, map } = get();

    // 이미 초기화 중이거나 완료된 경우 중복 실행 방지
    if (isInitializing || map) return;

    try {
      set({ isInitializing: true });

      // Google Maps API 로드 확인 및 필요시 로드
      if (!isGoogleMapsLoaded()) {
        await loadGoogleMapsIfNeeded();
      }

      // Google Maps API가 로드되었는지 다시 확인
      if (
        typeof window === 'undefined' ||
        !window.google ||
        !window.google.maps ||
        !window.google.maps.MapTypeId
      ) {
        throw new Error('Google Maps API is not loaded.');
      }

      // 지도 컨테이너 생성 (숨겨진 상태)
      const mapContainer = document.createElement('div');
      mapContainer.style.width = '100%';
      mapContainer.style.height = '100%';
      mapContainer.style.display = 'none';
      document.body.appendChild(mapContainer);

      const newMap = new window.google.maps.Map(mapContainer, {
        zoom: 13,
        center: { lat: 37.5665, lng: 126.978 }, // 서울 기본 위치
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      set({
        map: newMap,
        isMapLoaded: true,
        isInitializing: false,
      });
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      set({ isInitializing: false });
    }
  },

  // 지도 중심점 업데이트
  updateMapCenter: (lat: number, lng: number) => {
    const { map } = get();
    if (map) {
      map.setCenter({ lat, lng });
      map.setZoom(13);
    }
  },

  // 오버레이들 정리
  clearOverlays: () => {
    const { overlays } = get();
    overlays.forEach((overlay) => overlay.setMap(null));
    set({ overlays: [] });
  },

  // 프로필 이미지 오버레이 추가 (줌 레벨에 관계없이 일정한 범위 표시)
  addProfileOverlay: (
    lat: number,
    lng: number,
    imageUrl: string,
    name: string,
    isCurrentUser: boolean = false,
  ) => {
    const { map } = get();
    if (!map || !(map instanceof window.google.maps.Map)) {
      console.warn('Map not available for adding profile overlay');
      return;
    }

    // Google Maps API가 로드된 후에만 실행
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      try {
        // 좌표 유효성 검사
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.error('Invalid coordinates for profile overlay:', { lat, lng });
          return;
        }

        // 이미지 URL이 없거나 유효하지 않으면 기본 이미지 사용
        if (!imageUrl || typeof imageUrl !== 'string') {
          imageUrl = '/default-traveler.png';
        }

        const radius = 1000;
        const position = new google.maps.LatLng(lat, lng);

        const overlay = new ProfileOverlay(map, position, imageUrl, radius, name, isCurrentUser);

        set((state) => ({
          overlays: [...state.overlays, overlay],
        }));
      } catch (error) {
        console.error('Failed to add profile overlay:', error);
      }
    } else {
      console.warn('Google Maps API not loaded');
    }
  },

  // 지도 표시
  showMap: (containerId: string) => {
    const { map, currentContainerId } = get();
    if (!map) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    // 기존 컨테이너에서 지도 제거
    if (currentContainerId && currentContainerId !== containerId) {
      const prevContainer = document.getElementById(currentContainerId);
      if (prevContainer) {
        prevContainer.innerHTML = '';
      }
    }

    // 새 컨테이너에 지도 표시
    container.innerHTML = '';
    const mapElement = map.getDiv();
    container.appendChild(mapElement);
    mapElement.style.display = 'block';

    set({ currentContainerId: containerId });

    // 지도 리사이즈 트리거
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.google) {
        window.google.maps.event.trigger(map, 'resize');
      }
    }, 100);
  },

  // 지도 숨김
  hideMap: () => {
    const { map } = get();
    if (map) {
      const mapElement = map.getDiv();
      mapElement.style.display = 'none';
    }
    set({ currentContainerId: null });
  },

  // 스토어 리셋
  reset: () => {
    get().clearOverlays();

    set({
      map: null,
      isMapLoaded: false,
      overlays: [],
      currentContainerId: null,
      isInitializing: false,
    });
  },
}));
