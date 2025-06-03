import React, { useRef, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import QueueItem from './QueueItem';
import { Music } from 'lucide-react';

const QueueList: React.FC = () => {
  const { queue, currentSingerIndex } = useQueue();
  const currentSingerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to current singer when it changes
  useEffect(() => {
    if (currentSingerRef.current) {
      currentSingerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentSingerIndex]);
  
  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Music className="w-16 h-16 text-purple-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">The queue is empty</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to add your song to the queue!
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-300px)] p-4">
      <h2 className="text-xl font-bold mb-4">Current Queue</h2>
      
      <div className="space-y-2">
        {queue.map((singer, index) => (
          <div 
            key={singer.id} 
            ref={index === currentSingerIndex ? currentSingerRef : null}
            className="transition-all duration-500 ease-in-out"
          >
            <QueueItem singer={singer} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueueList;