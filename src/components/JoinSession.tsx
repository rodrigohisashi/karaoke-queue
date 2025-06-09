import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { signInWithGoogle, signInWithEmail, registerWithEmail } from '../utils/auth';

const JoinSession: React.FC = () => {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting', mode, 'with email:', email);
      if (mode === 'login') {
        const result = await signInWithEmail(email, password);
        console.log('Login successful:', result);
      } else {
        if (!nickname.trim()) {
          setError('Por favor, escolha um nickname');
          return;
        }
        const result = await registerWithEmail(email, password, nickname.trim());
        console.log('Registration successful:', result);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      let errorMessage = err.message || `${mode === 'login' ? 'Login' : 'Registration'} failed`;
      
      // Translate common Firebase error messages
      if (errorMessage.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (errorMessage.includes('auth/user-disabled')) {
        errorMessage = 'This account has been disabled';
      } else if (errorMessage.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email';
      } else if (errorMessage.includes('auth/wrong-password')) {
        errorMessage = 'Incorrect password';
      } else if (errorMessage.includes('auth/email-already-in-use')) {
        errorMessage = 'An account already exists with this email';
      } else if (errorMessage.includes('auth/weak-password')) {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 to-indigo-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Mic className="w-12 h-12 text-purple-500" />
          <h1 className="text-3xl font-bold ml-3">RHbirThday Karaoke</h1>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4">{error}</div>
        )}

        <div className="flex justify-center mb-6 space-x-2">
          <button
            className={`px-4 py-2 rounded font-medium ${mode === 'login' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded font-medium ${mode === 'register' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-2">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Como você quer ser chamado?"
                required={mode === 'register'}
                minLength={2}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="Enter your email"
              required
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
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-md transition-colors duration-300"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 bg-white text-purple-700 font-semibold rounded shadow hover:bg-gray-100 text-sm flex items-center justify-center"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default JoinSession;

