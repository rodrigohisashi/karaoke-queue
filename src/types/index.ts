export interface Singer {
  id: string;
  name: string;
  song: string;
  artist?: string;
  timestamp: number;
  completed: boolean;
  computed_times_sang?: number;
}

export interface QueueContextType {
  queue: Singer[];
  currentSingerIndex: number;
  addToQueue: (song: string, artist?: string) => void;
  removeSinger: (id: string) => void;
  markAsSung: (id: string) => void;
  userName: string | null;
  setUserName: (name: string) => void;
}