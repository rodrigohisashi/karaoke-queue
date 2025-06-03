/**
 * Generate a random ID string
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Format time elapsed since a timestamp
 */
export const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Get the status label for a singer based on their position
 */
export const getSingerStatus = (index: number, currentIndex: number): string => {
  if (index === currentIndex) return 'Now Singing';
  if (index === currentIndex + 1) return 'Up Next';
  return `${index - currentIndex} singers away`;
};

/**
 * Get the status color for a singer based on their position
 */
export const getStatusColor = (index: number, currentIndex: number): string => {
  if (index === currentIndex) return 'bg-pink-500';
  if (index === currentIndex + 1) return 'bg-purple-500';
  if (index === currentIndex + 2) return 'bg-indigo-500';
  return 'bg-slate-500';
};


