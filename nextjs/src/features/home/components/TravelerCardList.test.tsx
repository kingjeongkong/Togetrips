import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  TestWrapper,
  cleanupTestEnvironment,
  setupTestEnvironment,
} from '../../../test-utils/testWrapper';
import * as useSendRequestModule from '../hooks/useSendRequest';
import * as useUserLocationModule from '../hooks/useUserLocation';
import TravelerCardList from './TravelerCardList';

jest.mock('../hooks/useUserLocation');
jest.mock('../hooks/useSendRequest');

const mockUsers = [
  { id: '1', name: 'Alice', image: '/alice.png', bio: 'Hi', tags: 'tag1', distance: 1000 },
  { id: '2', name: 'Bob', image: '/bob.png', bio: 'Hello', tags: 'tag2', distance: 2000 },
  { id: '3', name: 'James', image: '/james.png', bio: 'No distance', tags: 'tag3' },
];

describe('TravelerCardList', () => {
  beforeEach(() => {
    setupTestEnvironment();

    (useSendRequestModule.useSendRequest as jest.Mock).mockReturnValue({
      sendRequest: jest.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('로딩 중이면 LoadingIndicator가 렌더링된다', () => {
    (useUserLocationModule.useUserLocation as jest.Mock).mockReturnValue({
      users: [],
      usersLoading: true,
    });
    render(<TravelerCardList />, { wrapper: TestWrapper });
    expect(screen.getByRole('loading')).toBeInTheDocument(); // LoadingIndicator
  });

  it('유저 목록이 있으면 TravelerCard가 모두 렌더링된다(distance가 없는 유저는 렌더링되지 않는다)', () => {
    (useUserLocationModule.useUserLocation as jest.Mock).mockReturnValue({
      users: mockUsers,
      usersLoading: false,
    });
    render(<TravelerCardList />, { wrapper: TestWrapper });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('James')).not.toBeInTheDocument();
  });

  it('유저가 없으면 TravelerCard가 렌더링되지 않는다', () => {
    (useUserLocationModule.useUserLocation as jest.Mock).mockReturnValue({
      users: [],
      usersLoading: false,
    });
    render(<TravelerCardList />, { wrapper: TestWrapper });
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('정상 로드 시 ErrorBoundary가 나타나지 않는다', () => {
    (useUserLocationModule.useUserLocation as jest.Mock).mockReturnValue({
      users: mockUsers,
      usersLoading: false,
    });
    render(<TravelerCardList />, { wrapper: TestWrapper });

    expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
  });

  it('훅이 에러를 throw 하면 ErrorBoundary Fallback UI를 표시한다', () => {
    // 훅이 예외를 throw하도록 모킹
    (useUserLocationModule.useUserLocation as jest.Mock).mockImplementation(() => {
      throw new Error('강제 에러');
    });

    // React 18+에선 콘솔 오류가 테스트 로그에 출력되므로 잠시 mute
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TravelerCardList />, { wrapper: TestWrapper });

    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

    // console.error 원복
    (console.error as jest.Mock).mockRestore();
  });
});
