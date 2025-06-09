import { User, UserCredential } from 'firebase/auth';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum UserPermission {
  // User permissions
  MARK_OWN_SONG_SUNG = 'MARK_OWN_SONG_SUNG',
  REMOVE_OWN_SONG = 'REMOVE_OWN_SONG',
  
  // Admin permissions
  MARK_ANY_SONG_SUNG = 'MARK_ANY_SONG_SUNG',
  REMOVE_ANY_SONG = 'REMOVE_ANY_SONG',
  REORDER_QUEUE = 'REORDER_QUEUE'
}

export const RolePermissions: Record<UserRole, UserPermission[]> = {
  [UserRole.ADMIN]: [
    UserPermission.MARK_OWN_SONG_SUNG,
    UserPermission.REMOVE_OWN_SONG,
    UserPermission.MARK_ANY_SONG_SUNG,
    UserPermission.REMOVE_ANY_SONG,
    UserPermission.REORDER_QUEUE
  ],
  [UserRole.USER]: [
    UserPermission.MARK_OWN_SONG_SUNG,
    UserPermission.REMOVE_OWN_SONG
  ]
};

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

export interface AdminUser {
  role: UserRole;
  email: string;
  lastUpdated: number;
  displayName?: string;
  photoURL?: string;
  permissions?: UserPermission[];
}

export interface QueueContextType {
  queue: Singer[];
  currentSingerIndex: number;
  addToQueue: (song: string, artist?: string) => void;
  removeSinger: (id: string) => void;
  markAsSung: (id: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => Promise<void>;
  userName: string | null;
  setUserName: (name: string) => void;
  user: User | null;
  signInWithGoogle: () => Promise<UserCredential>;
  signOutUser: () => Promise<void>;
  viewMode: 'current' | 'completed';
  setViewMode: (mode: 'current' | 'completed') => void;
  completedSongs: Singer[];
  userRole: UserRole;
  userPermissions: UserPermission[];
  checkUserRole: () => Promise<void>;
  hasPermission: (permission: UserPermission) => boolean;
}

