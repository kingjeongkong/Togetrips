/**
 * 프로필 이미지를 지도 위에 원형으로 표시하는 커스텀 오버레이 클래스.
 * google.maps.OverlayView를 확장하여 HTML 요소를 지도에 렌더링합니다.
 */
export class ProfileOverlay {
  private position: google.maps.LatLng;
  private imageUrl: string;
  private radiusInMeters: number;
  private div: HTMLDivElement | null = null;
  private map: google.maps.Map;
  private name: string;
  private isCurrentUser: boolean;
  private overlay: google.maps.OverlayView | null = null;

  // 성능 최적화를 위한 캐시 변수들
  private lastZoom: number | null = null;
  private lastCenter: google.maps.LatLng | null = null;
  private cachedDiameter: number | null = null;
  private imageLoadState: 'loading' | 'loaded' | 'error' = 'loading';

  constructor(
    map: google.maps.Map,
    position: google.maps.LatLng,
    imageUrl: string,
    radiusInMeters: number,
    name: string,
    isCurrentUser: boolean = false,
  ) {
    this.map = map;
    this.position = position;
    this.imageUrl = imageUrl;
    this.radiusInMeters = radiusInMeters;
    this.name = name;
    this.isCurrentUser = isCurrentUser;

    this.createOverlay();
  }

  private createOverlay() {
    // Google Maps API가 로드된 후에만 실행
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this.overlay = new (class extends google.maps.OverlayView {
        private parent: ProfileOverlay;

        constructor(parent: ProfileOverlay) {
          super();
          this.parent = parent;
        }

        onAdd() {
          this.parent.div = document.createElement('div');
          this.parent.div.style.position = 'absolute';
          this.parent.div.style.borderRadius = '50%';
          this.parent.div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
          this.parent.div.style.border = `3px solid ${this.parent.isCurrentUser ? '#8B5CF6' : '#EF4444'}`;
          this.parent.div.style.zIndex = this.parent.isCurrentUser ? '1001' : '1000';
          this.parent.div.style.background = '#f3f4f6';
          this.parent.div.style.display = 'flex';
          this.parent.div.style.alignItems = 'center';
          this.parent.div.style.justifyContent = 'center';
          this.parent.div.style.fontSize = '12px';
          this.parent.div.style.color = '#6b7280';
          this.parent.div.style.fontWeight = '500';

          // 접근성을 위한 속성 추가
          this.parent.div.setAttribute('role', 'img');
          this.parent.div.setAttribute(
            'aria-label',
            `${this.parent.name}'s location (${this.parent.isCurrentUser ? 'current user' : 'traveler'})`,
          );

          // 이미지 로딩 처리
          this.parent.loadImage();

          const panes = this.getPanes();
          panes?.overlayMouseTarget.appendChild(this.parent.div);
        }

        draw() {
          const projection = this.getProjection();
          if (!projection || !this.parent.div) {
            return;
          }

          const currentZoom = this.parent.map.getZoom()!;
          const currentCenter = this.parent.map.getCenter()!;

          // 줌 레벨이나 중심점이 변경되지 않았고 캐시된 값이 있으면 재사용
          if (
            this.parent.lastZoom === currentZoom &&
            this.parent.lastCenter &&
            this.parent.lastCenter.equals(currentCenter) &&
            this.parent.cachedDiameter !== null
          ) {
            this.parent.updatePosition(projection, this.parent.cachedDiameter);
            return;
          }

          // 1. 위경도 좌표를 화면의 픽셀 좌표로 변환합니다.
          const sw = projection.fromLatLngToDivPixel(this.parent.position)!;

          // 2. 지도의 현재 줌 레벨에서 1미터가 몇 픽셀에 해당하는지 계산합니다.
          const metersPerPixel =
            (156543.03392 * Math.cos((currentCenter.lat() * Math.PI) / 180)) /
            Math.pow(2, currentZoom);

          // 3. 설정된 반경(미터)을 픽셀 크기로 변환합니다.
          const radiusInPixels = this.parent.radiusInMeters / metersPerPixel;
          const diameterInPixels = radiusInPixels * 2;

          // 4. 캐시 업데이트
          this.parent.lastZoom = currentZoom;
          this.parent.lastCenter = currentCenter;
          this.parent.cachedDiameter = diameterInPixels;

          // 5. 계산된 크기와 위치를 div에 적용합니다.
          this.parent.updatePosition(projection, diameterInPixels);
        }

        onRemove() {
          if (this.parent.div) {
            this.parent.div.parentNode?.removeChild(this.parent.div);
            this.parent.div = null;
          }
        }
      })(this);

      this.overlay.setMap(this.map);
    }
  }

  /**
   * 위치 업데이트 (성능 최적화를 위해 분리)
   */
  private updatePosition(projection: google.maps.MapCanvasProjection, diameterInPixels: number) {
    if (!this.div) return;

    const sw = projection.fromLatLngToDivPixel(this.position)!;
    const radiusInPixels = diameterInPixels / 2;

    this.div.style.width = `${diameterInPixels}px`;
    this.div.style.height = `${diameterInPixels}px`;
    this.div.style.left = `${sw.x - radiusInPixels}px`;
    this.div.style.top = `${sw.y - radiusInPixels}px`;
  }

  /**
   * 이미지 로딩 처리
   */
  private loadImage() {
    if (!this.div) return;

    // 기본 이미지인 경우 즉시 설정
    if (this.imageUrl === '/default-traveler.png') {
      this.imageLoadState = 'loaded';
      this.div.style.backgroundImage = `url(${this.imageUrl})`;
      this.div.style.backgroundSize = 'cover';
      this.div.style.backgroundPosition = 'center';
      this.div.textContent = '';
      return;
    }

    // 로딩 상태 표시
    this.div.textContent = '...';
    this.imageLoadState = 'loading';

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      this.imageLoadState = 'loaded';
      if (this.div) {
        this.div.style.backgroundImage = `url(${this.imageUrl})`;
        this.div.style.backgroundSize = 'cover';
        this.div.style.backgroundPosition = 'center';
        this.div.textContent = '';
      }
    };

    img.onerror = () => {
      this.imageLoadState = 'error';
      if (this.div) {
        // 기본 이미지로 fallback
        this.div.style.backgroundImage = `url(/default-traveler.png)`;
        this.div.style.backgroundSize = 'cover';
        this.div.style.backgroundPosition = 'center';
        this.div.textContent = '';
      }
    };

    img.src = this.imageUrl;
  }

  /**
   * 오버레이를 지도에서 제거
   */
  setMap(map: google.maps.Map | null) {
    if (this.overlay) {
      this.overlay.setMap(map);
    }
  }

  // 오버레이를 숨기기 위한 편의 메소드
  hide() {
    if (this.div) {
      this.div.style.display = 'none';
    }
  }

  // 오버레이를 다시 보여주기 위한 편의 메소드
  show() {
    if (this.div) {
      this.div.style.display = 'block';
    }
  }
}
