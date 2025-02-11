import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import SignInPage from './pages/Auth/SignIn';
import SignUpPage from './pages/Auth/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Main/Home';
import ChatLayout from './pages/Main/ChatLayout';
import Requests from './pages/Main/Requests';
import Profile from './pages/Main/Profile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import BaseErrorBoundary from './components/ErrorBoundary/BaseErrorBoundary';
import { ToastContainer } from 'react-toastify';
import ChatList from './features/Chat/components/ChatList';
import ChatRoom from './features/Chat/components/ChatRoom';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: true
      }
    }
  });

  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route
          element={
            <BaseErrorBoundary>
              <ProtectedRoute />
            </BaseErrorBoundary>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<ChatLayout />}>
            <Route index element={<ChatList />} />
            <Route path=":chatRoomID" element={<ChatRoom />} />
          </Route>
          <Route path="/requests" element={<Requests />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </>
    )
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <RouterProvider router={router} />
        <ToastContainer
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick={true}
          draggable={true}
        />
      </LoadScript>
    </QueryClientProvider>
  );
}

export default App;
