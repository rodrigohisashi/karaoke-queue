import React, { useState } from 'react';
import { Music, Mic, X, Check, GripVertical } from 'lucide-react';
import { Singer } from '../types';
import { formatTimeAgo, getSingerStatus, getStatusColor } from '../utils/helpers';
import { useQueue } from '../context/QueueContext';
import { UserPermission } from '../types';

interface QueueItemProps {
  singer: Singer;
  index: number;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

const QueueItem: React.FC<QueueItemProps> = ({ 
  singer, 
  index, 
  onDragStart, 
  onDragOver, 
  onDrop 
}) => {
  const { currentSingerIndex, removeSinger, markAsSung, hasPermission, userRole } = useQueue();
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const status = getSingerStatus(index, currentSingerIndex);
  const statusColor = getStatusColor(index, currentSingerIndex);
  
  const isCurrentUserEntry = singer.isCurrentUser;
  const canRemove = isCurrentUserEntry 
    ? hasPermission(UserPermission.REMOVE_OWN_SONG)
    : hasPermission(UserPermission.REMOVE_ANY_SONG);
  
  const canMarkSung = isCurrentUserEntry
    ? hasPermission(UserPermission.MARK_OWN_SONG_SUNG)
    : hasPermission(UserPermission.MARK_ANY_SONG_SUNG);

  const canReorder = hasPermission(UserPermission.REORDER_QUEUE);

  const getCardStyle = () => {
    if (singer.completed) return 'border-green-500 bg-green-50/50 dark:bg-green-950/20';
    if (index === currentSingerIndex) return 'border-pink-500 shadow-lg shadow-pink-100 dark:shadow-pink-900/30';
    if (index === currentSingerIndex + 1) return 'border-purple-400 shadow-md';
    return 'border-gray-200';
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart?.(e, index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver?.(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop?.(e, index);
  };

  return (
    <div 
      className={`relative mb-4 p-4 rounded-lg border ${getCardStyle()} 
                transition-all duration-300 hover:shadow-md
                ${isCurrentUserEntry && !singer.completed ? 'bg-purple-50/50 dark:bg-purple-950/20' : 'bg-white dark:bg-gray-800'}
                ${isDragging ? 'opacity-50 cursor-grabbing' : ''}
                ${isDragOver ? 'border-dashed border-purple-500 bg-purple-50/50 dark:bg-purple-950/20' : ''}
                ${canReorder ? 'cursor-grab' : ''}`}
      draggable={canReorder}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {canReorder && (
            <GripVertical className={`w-5 h-5 text-gray-400 mr-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} />
          )}
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${singer.completed ? 'bg-green-500' : statusColor} text-white mr-4`}>
            {singer.completed ? (
              <Check className="w-5 h-5" />
            ) : index === currentSingerIndex ? (
              <Mic className="w-5 h-5 animate-pulse" />
            ) : (
              <span className="font-semibold">{index + 1}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{singer.name}</h3>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Music className="w-4 h-4 mr-1" />
              <span className="font-medium">{singer.song}</span>
              {singer.artist && (
                <>
                  <span className="mx-1">•</span>
                  <span className="text-gray-500 dark:text-gray-400">{singer.artist}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {!singer.completed && (
          <div className="flex gap-2">
            {canMarkSung && index <= currentSingerIndex && (
              <button 
                onClick={() => markAsSung(singer.id)}
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="Mark as sung"
              >
                <Check className="w-5 h-5" />
              </button>
            )}
            {canRemove && (
              <button 
                onClick={() => removeSinger(singer.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove from queue"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-2">
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${singer.completed ? 'bg-green-500' : statusColor} text-white`}>
          {singer.completed ? 'Completed' : status}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {singer.completed ? 'Completed' : 'Added'} {formatTimeAgo(singer.timestamp)}
        </span>
      </div>
      
      {isCurrentUserEntry && !singer.completed && (
        <div className="absolute -right-1 -top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800" />
      )}
    </div>
  );
};

export default QueueItem;