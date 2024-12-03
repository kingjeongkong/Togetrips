import React from 'react';

const LoginPage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-2xl text-center font-bold mb-6">Sign in to your account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            className="block p-2 w-full border border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="block p-2 w-full border border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mb-6"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Sign in
          </button>
        </form>
        <div className="flex justify-center gap-x-16 mt-6">
          <a href="#" className="text-indigo-600 hover:underline">
            Forgot password?
          </a>
          <a href="#" className="text-indigo-600 hover:underline">
            Don't have an account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
