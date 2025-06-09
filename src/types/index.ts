import { User } from 'firebase/auth';

export interface Singer {
  id: string;
  name: string;
  song: string;
  artist?: string;
  timestamp: number;
  completed: boolean;
  computed_times_sang?: number;
  isCurrentUser?: boolean;
}

export interface QueueContextType {
  queue: Singer[];
  currentSingerIndex: number;
  addToQueue: (song: string, artist?: string) => void;
  removeSinger: (id: string) => void;
  markAsSung: (id: string) => void;
  userName: string | null;
  setUserName: (name: string) => void;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  viewMode: 'current' | 'completed';
  setViewMode: (mode: 'current' | 'completed') => void;
  completedSongs: Singer[];
}

