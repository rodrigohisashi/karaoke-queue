import React from 'react';
import { Mic } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

const Header: React.FC = () => {
  const { queue, currentSingerIndex, user, signInWithGoogle, signOutUser } = useQueue();
  const currentSinger = queue[currentSingerIndex];
  
  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Mic className="w-8 h-8 mr-2" />
            <h1 className="text-2xl font-bold">
              <span className="text-purple-300">RH</span>
              bir
              <span className="text-purple-300">T</span>
              hday Karaoke
            </h1>
          </div>
          <div>
            {user ? (
              <div className="flex items-center space-x-3">
                {user.photoURL && (
                  <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white" />
                )}
                <span className="font-medium">{user.displayName || user.email}</span>
                <button
                  onClick={signOutUser}
                  className="ml-2 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-4 py-2 bg-white text-purple-700 font-semibold rounded shadow hover:bg-gray-100 text-sm"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-sm opacity-80">Total in queue:</span>
            <span className="ml-2 font-bold">{queue.length}</span>
          </div>
          {queue.length > 0 && (
            <div className="text-sm">
              <span className="opacity-80">
                {queue.filter(singer => singer.isCurrentUser).length > 0 
                  ? 'You have songs in the queue' 
                  : 'Add your song below'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

