import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

const JoinSession: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { setUserName } = useQueue();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setUserName(name.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 to-indigo-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Mic className="w-12 h-12 text-purple-500" />
          <h1 className="text-3xl font-bold ml-3">RHbirThday Karaoke</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter Your Name
            </label>
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
        </form>
      </div>
    </div>
  );
};

export default JoinSession;