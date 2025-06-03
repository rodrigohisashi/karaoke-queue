import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { signInWithGoogle } from '../utils/auth';

const JoinSession: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'guest' | 'login'>('guest');
  const { setUserName } = useQueue();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'guest') {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      setUserName(name.trim());
    } else {
      // Email/password login/register logic (to be implemented)
      setError('Email/password login is not implemented yet. Please use Google sign-in or guest mode.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 to-indigo-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Mic className="w-12 h-12 text-purple-500" />
          <h1 className="text-3xl font-bold ml-3">RHbirThday Karaoke</h1>
        </div>
        <div className="flex justify-center mb-6 space-x-2">
          <button
            className={`px-4 py-2 rounded font-medium ${mode === 'guest' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            onClick={() => setMode('guest')}
          >
            Join as Guest
          </button>
          <button
            className={`px-4 py-2 rounded font-medium ${mode === 'login' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            onClick={() => setMode('login')}
          >
            Login/Register
          </button>
        </div>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4">{error}</div>
        )}
        {mode === 'guest' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Enter Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="How should we call you?"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-md transition-colors duration-300 flex items-center justify-center"
            >
              Join Karaoke Session
            </button>
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2 px-4 bg-white text-purple-700 font-semibold rounded shadow hover:bg-gray-100 text-sm flex items-center justify-center"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Sign in with Google
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-md transition-colors duration-300 flex items-center justify-center"
            >
              Login / Register
            </button>
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2 px-4 bg-white text-purple-700 font-semibold rounded shadow hover:bg-gray-100 text-sm flex items-center justify-center"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Sign in with Google
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinSession;

