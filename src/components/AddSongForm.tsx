import React, { useState } from 'react';
import { Mic, Music, User } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

const AddSongForm: React.FC = () => {
  const { addToQueue } = useQueue();
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!song.trim()) {
      setError('Please enter a song title');
      return;
    }
    
    addToQueue(song, artist.trim() || undefined);
    
    setSong('');
    setArtist('');
    setError('');
    setIsOpen(false);
  };
  
  return (
    <div className="sticky bottom-0 w-full bg-white dark:bg-gray-900 shadow-lg rounded-t-xl border-t border-gray-200 dark:border-gray-700">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-4 px-6 flex items-center justify-center space-x-2 text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-300 rounded-t-xl font-medium"
        >
          <Mic className="w-5 h-5" />
          <span>Add Your Song to the Queue</span>
        </button>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Add Your Song</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Song Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Music className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter song title"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Artist (Optional)
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter artist name (optional)"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-md transition-colors duration-300 flex items-center justify-center"
            >
              <Mic className="w-5 h-5 mr-2" />
              Add to Queue
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddSongForm;