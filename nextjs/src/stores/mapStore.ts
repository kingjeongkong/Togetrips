import { isGoogleMapsLoaded, loadGoogleMapsScript } from '@/lib/google-maps';
import { create } from 'zustand';

interface MapStore {
  // 상태
  map: google.maps.Map | null;
  isMapLoaded: boolean;
  circles: google.maps.Circle[];
  currentContainerId: string | null;
  isInitializing: boolean;

  // 액션
  initializeMap: () => Promise<void>;
  updateMapCenter: (lat: number, lng: number) => void;
  clearCircles: () => void;
  addLocationCircle: (
    lat: number,
    lng: number,
    color: string,
    fillOpacity: number,
    radius: number,
  ) => google.maps.Circle;
  showMap: (containerId: string) => void;
  hideMap: () => void;
  reset: () => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  // 초기 상태
  map: null,
  isMapLoaded: false,
  circles: [],
  currentContainerId: null,
  isInitializing: false,

  // 지도 초기화
  initializeMap: async () => {
    const { isInitializing, map } = get();

    // 이미 초기화 중이거나 완료된 경우 중복 실행 방지
    if (isInitializing || map) return;

    try {
      set({ isInitializing: true });

      if (!isGoogleMapsLoaded()) {
        await loadGoogleMapsScript();
      }

      // Google Maps API가 완전히 로드되었는지 다시 한번 확인
      if (!window.google || !window.google.maps || !window.google.maps.MapTypeId) {
        console.warn('Google Maps API not fully loaded, retrying...');
        // 잠시 대기 후 다시 시도
        setTimeout(() => {
          set({ isInitializing: false });
          get().initializeMap();
        }, 1000);
        return;
      }

      // 지도 컨테이너 생성 (숨겨진 상태)
      const mapContainer = document.createElement('div');
      mapContainer.style.width = '100%';
      mapContainer.style.height = '100%';
      mapContainer.style.display = 'none';
      document.body.appendChild(mapContainer);

      const newMap = new google.maps.Map(mapContainer, {
        zoom: 13,
        center: { lat: 37.5665, lng: 126.978 }, // 서울 기본 위치
        mapTypeId: google.maps.MapTypeId.ROADMAP,
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

  // 원들 정리
  clearCircles: () => {
    const { circles } = get();
    circles.forEach((circle) => circle.setMap(null));
    set({ circles: [] });
  },

  // 위치 원 추가
  addLocationCircle: (
    lat: number,
    lng: number,
    color: string = '#FF0000',
    fillOpacity: number = 0.15,
    radius: number = 700,
  ): google.maps.Circle => {
    const { map } = get();
    if (!map) throw new Error('Map not initialized');

    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity,
      map,
      center: { lat, lng },
      radius,
    });

    set((state) => ({
      circles: [...state.circles, circle],
    }));

    return circle;
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
      google.maps.event.trigger(map, 'resize');
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
    const { circles } = get();
    circles.forEach((circle) => circle.setMap(null));

    set({
      map: null,
      isMapLoaded: false,
      circles: [],
      currentContainerId: null,
      isInitializing: false,
    });
  },
}));
