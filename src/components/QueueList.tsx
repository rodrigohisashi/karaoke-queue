import React, { useRef, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import QueueItem from './QueueItem';
import { Music, History } from 'lucide-react';

const QueueList: React.FC = () => {
  const { queue, currentSingerIndex, viewMode, setViewMode, completedSongs } = useQueue();
  const currentSingerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to current singer when it changes
  useEffect(() => {
    if (currentSingerRef.current && viewMode === 'current') {
      currentSingerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentSingerIndex, viewMode]);
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Music className="w-16 h-16 text-purple-300 mb-4" />
      <h2 className="text-xl font-bold mb-2">
        {viewMode === 'current' ? 'The queue is empty' : 'No completed songs yet'}
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        {viewMode === 'current' 
          ? 'Be the first to add your song to the queue!'
          : 'Songs will appear here once they are completed'}
      </p>
    </div>
  );

  const renderQueue = () => {
    const songs = viewMode === 'current' ? queue : completedSongs;
    
    if (songs.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-2">
        {songs.map((singer, index) => (
          <div 
            key={singer.id} 
            ref={viewMode === 'current' && index === currentSingerIndex ? currentSingerRef : null}
            className="transition-all duration-500 ease-in-out"
          >
            <QueueItem singer={singer} index={index} />
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-300px)] p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {viewMode === 'current' ? 'Current Queue' : 'Completed Songs'}
        </h2>
        <button
          onClick={() => setViewMode(viewMode === 'current' ? 'completed' : 'current')}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
        >
          {viewMode === 'current' ? (
            <>
              <History className="w-5 h-5" />
              <span>View Completed</span>
            </>
          ) : (
            <>
              <Music className="w-5 h-5" />
              <span>View Current</span>
            </>
          )}
        </button>
      </div>
      
      {renderQueue()}
    </div>
  );
};

export default QueueList;