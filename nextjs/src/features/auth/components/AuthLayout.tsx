import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout = ({ children, title }: AuthLayoutProps) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
        <h2 className="text-center text-3xl font-bold mb-6 text-gray-900">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
