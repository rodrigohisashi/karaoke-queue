import React, { useEffect, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { getSingerStatus } from '../utils/helpers';

const YourPosition: React.FC = () => {
  const { queue, currentSingerIndex } = useQueue();
  const [userPositions, setUserPositions] = useState<number[]>([]);
  
  // Find user's positions in the queue
  useEffect(() => {
    const positions = queue
      .map((singer, index) => singer.isCurrentUser ? index : -1)
      .filter(pos => pos !== -1);
    
    setUserPositions(positions);
  }, [queue]);
  
  if (userPositions.length === 0) {
    return null;
  }
  
  // Find the next position where the user will sing
  const nextPosition = userPositions.find(pos => pos >= currentSingerIndex);
  
  if (nextPosition === undefined) {
    return null;
  }
  
  const status = getSingerStatus(nextPosition, currentSingerIndex);
  const waitCount = nextPosition - currentSingerIndex;
  
  // Style based on wait time
  const getBgColor = () => {
    if (waitCount === 0) return 'bg-pink-500';
    if (waitCount === 1) return 'bg-purple-500';
    if (waitCount <= 3) return 'bg-indigo-500';
    return 'bg-blue-500';
  };
  
  return (
    <div className={`${getBgColor()} text-white p-4 rounded-lg shadow-md mb-6 animate-fadeIn`}>
      <h2 className="text-lg font-bold mb-1">Your Position</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">
            {waitCount === 0 ? (
              "You're up now!"
            ) : (
              `${waitCount} ${waitCount === 1 ? 'singer' : 'singers'} before you`
            )}
          </p>
          <p className="text-sm opacity-90">
            {status}
          </p>
        </div>
        <div className="text-4xl font-bold">
          #{nextPosition + 1}
        </div>
      </div>
      {userPositions.length > 1 && (
        <p className="text-sm mt-2 border-t border-white/20 pt-2">
          You have {userPositions.length} songs in the queue
        </p>
      )}
    </div>
  );
};

export default YourPosition;