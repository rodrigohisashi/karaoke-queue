import React from 'react';
import { Mic } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

const Header: React.FC = () => {
  const { queue, currentSingerIndex } = useQueue();
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
        </div>
        
        {currentSinger && (
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-sm uppercase tracking-wider opacity-80 mb-1">
              Now Singing
            </div>
            <div className="flex items-center">
              <div className="mr-3 h-10 w-10 bg-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xl">{currentSinger.name}</div>
                <div className="opacity-90">
                  {currentSinger.song}
                  {currentSinger.artist && (
                    <span> • {currentSinger.artist}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-6">
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