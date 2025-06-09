import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    ref,
    onValue,
    push,
    set,
    runTransaction,
    remove,
    serverTimestamp,
    query as rtdbQuery,
    orderByChild,
    get,
    update
} from 'firebase/database';
import { db as rtdb } from '../firebase/config';
import { QueueContextType, Singer, UserRole, UserPermission } from '../types';
import { subscribeToAuth, signInWithGoogle, signOutUser, getUserRoleAndPermissions, hasPermission } from '../utils/auth';
import { User, UserCredential } from 'firebase/auth';

type ViewMode = 'current' | 'completed';

const QueueContext = createContext<QueueContextType>({
    queue: [],
    currentSingerIndex: 0,
    addToQueue: async () => {},
    removeSinger: async () => {},
    markAsSung: async () => {},
    reorderQueue: async () => {},
    userName: null,
    setUserName: () => {},
    user: null,
    signInWithGoogle: async () => {
        throw new Error('signInWithGoogle not implemented');
    },
    signOutUser: async () => {},
    viewMode: 'current',
    setViewMode: () => {},
    completedSongs: [],
    userRole: UserRole.USER,
    userPermissions: [],
    checkUserRole: async () => {},
    hasPermission: () => false
});

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // The "live" queue after sorting. Exposed to consumers.
    const [queue, setQueue] = useState<Singer[]>([]);
    // Index of the first entry with completed === false
    const [currentSingerIndex, setCurrentSingerIndex] = useState<number>(0);
    // Local state for raw userName
    const [userName, setUserName] = useState<string | null>(() => {
        return localStorage.getItem('karaokeUserName');
    });
    // Firebase user state
    const [user, setUser] = useState<User | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('current');
    const [completedSongs, setCompletedSongs] = useState<Singer[]>([]);
    const [userRole, setUserRole] = useState<UserRole>(UserRole.USER);
    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);

    // Check user role and permissions
    const checkUserRole = async () => {
        const { role, permissions } = await getUserRoleAndPermissions();
        setUserRole(role);
        setUserPermissions(permissions);
    };

    // Check if user has specific permission
    const checkPermission = (permission: UserPermission): boolean => {
        return hasPermission(userPermissions, permission);
    };

    // Persist userName into localStorage
    useEffect(() => {
        if (userName) {
            localStorage.setItem('karaokeUserName', userName);
        }
    }, [userName]);

    // Listen for Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = subscribeToAuth(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser && firebaseUser.displayName) {
                setUserName(firebaseUser.displayName);
                // Check user role when user changes
                await checkUserRole();
            } else {
                setUserRole(UserRole.USER);
                setUserPermissions([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Listen to queue changes
    useEffect(() => {
        const queueRef = ref(rtdb, 'queue');
        const q = rtdbQuery(queueRef, orderByChild('timestamp'));

        const unsubscribe = onValue(q, (snapshot) => {
            const dataObj = snapshot.val() || {};
            const rawList: Singer[] = Object.entries(dataObj).map(([key, value]) => {
                const item = value as {
                    name: string;
                    song: string;
                    artist?: string | null;
                    timestamp: number | object;
                    completed: boolean;
                    order?: number;
                };
                const tsNum = typeof item.timestamp === 'object'
                    ? Date.now()
                    : (item.timestamp as number);

                return {
                    id: key,
                    name: item.name,
                    song: item.song,
                    artist: item.artist ?? undefined,
                    timestamp: tsNum,
                    completed: item.completed,
                    isCurrentUser: item.name === userName,
                    computed_times_sang: 0,
                    order: item.order
                };
            });

            // Separate completed and current songs
            const completed = rawList.filter(song => song.completed);
            setCompletedSongs(completed.sort((a, b) => b.timestamp - a.timestamp));

            // Filter out completed songs for the current queue
            const currentSongs = rawList.filter(song => !song.completed);

            // Split songs into manually ordered and naturally ordered
            const manuallyOrdered = currentSongs.filter(song => song.order !== undefined)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            const naturallyOrdered = currentSongs.filter(song => song.order === undefined);

            // Count how many times each user has "completed"
            const counts: Record<string, number> = {};
            for (const e of rawList) {
                if (e.completed) {
                    counts[e.name] = (counts[e.name] || 0) + 1;
                }
            }

            // Annotate each entry with its user's sung-count
            for (const entry of naturallyOrdered) {
                entry.computed_times_sang = counts[entry.name] || 0;
            }

            // Group naturally ordered entries by user
            const byUser: Record<string, Singer[]> = {};
            naturallyOrdered.forEach(entry => {
                if (!byUser[entry.name]) byUser[entry.name] = [];
                byUser[entry.name].push(entry);
            });

            // Sort each user's array by timestamp (FIFO)
            Object.values(byUser).forEach(arr => {
                arr.sort((a, b) => a.timestamp - b.timestamp);
            });

            // Sort usernames by (count asc, earliest timestamp asc)
            const userList = Object.keys(byUser).sort((u1, u2) => {
                const c1 = counts[u1] || 0;
                const c2 = counts[u2] || 0;
                if (c1 !== c2) return c1 - c2;
                // tie-break by first entry's timestamp
                return byUser[u1][0].timestamp - byUser[u2][0].timestamp;
            });

            // Round-robin across each user in `userList`
            const interleaved: Singer[] = [];
            let more = true;
            while (more) {
                more = false;
                for (const user of userList) {
                    const arr = byUser[user];
                    if (arr.length > 0) {
                        interleaved.push(arr.shift()!);
                        more = true;
                    }
                }
            }

            // Combine manually ordered songs with naturally ordered songs
            const finalQueue = [...manuallyOrdered, ...interleaved];
            setQueue(finalQueue);

            // Find first not-completed
            const nextIdx = finalQueue.findIndex(e => !e.completed);
            setCurrentSingerIndex(nextIdx !== -1 ? nextIdx : -1);
        });

        return () => unsubscribe();
    }, [userName]);

    // Add to queue
    const addToQueue = async (song: string, artist?: string) => {
        if (!userName) return;

        const queueRef = ref(rtdb, 'queue');
        const newSinger = {
            id: Math.random().toString(36).substring(2, 10),
            name: userName,
            song,
            timestamp: Date.now(),
            completed: false,
            isCurrentUser: true,
            computed_times_sang: 0,
            ...(artist ? { artist } : {}) // Only include artist if it's provided
        };

        await push(queueRef, newSinger);
    };

    //
    // ─── REMOVE A SONG FROM THE QUEUE ────────────────────────────────────────────────────
    //
    const removeSinger = async (id: string) => {
        const singer = queue.find(s => s.id === id);
        if (!singer) return;

        // Check permissions
        if (singer.isCurrentUser) {
            if (!checkPermission(UserPermission.REMOVE_OWN_SONG)) return;
        } else {
            if (!checkPermission(UserPermission.REMOVE_ANY_SONG)) return;
        }

        const singerRef = ref(rtdb, `queue/${id}`);
        await remove(singerRef);
    };

    //
    // ─── MARK "SANG" ──────────────────────────────────────────────────────────────────────
    //
    const markAsSung = async (id: string) => {
        const singer = queue.find(s => s.id === id);
        if (!singer) return;

        // Check permissions
        if (singer.isCurrentUser) {
            if (!checkPermission(UserPermission.MARK_OWN_SONG_SUNG)) return;
        } else {
            if (!checkPermission(UserPermission.MARK_ANY_SONG_SUNG)) return;
        }

        const singerRef = ref(rtdb, `queue/${id}`);
        await runTransaction(singerRef, (currentData) => {
            if (currentData) {
                currentData.completed = true;
            }
            return currentData;
        });
    };

    // Reorder queue (admin only)
    const reorderQueue = async (fromIndex: number, toIndex: number) => {
        if (!checkPermission(UserPermission.REORDER_QUEUE)) return;

        try {
            const queueRef = ref(rtdb, 'queue');
            const newQueue = [...queue];
            const [movedItem] = newQueue.splice(fromIndex, 1);
            newQueue.splice(toIndex, 0, movedItem);

            // Calculate new orders for all items up to the moved item's new position
            const updates: Record<string, number> = {};
            for (let i = 0; i <= toIndex; i++) {
                updates[`${newQueue[i].id}/order`] = i;
            }

            // Update the orders in Firebase
            await update(queueRef, updates);
        } catch (error) {
            console.error('Error reordering queue:', error);
        }
    };

    return (
        <QueueContext.Provider
            value={{
                queue,
                currentSingerIndex,
                addToQueue,
                removeSinger,
                markAsSung,
                reorderQueue,
                userName,
                setUserName,
                user,
                signInWithGoogle,
                signOutUser,
                viewMode,
                setViewMode,
                completedSongs,
                userRole,
                userPermissions,
                checkUserRole,
                hasPermission: checkPermission
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => useContext(QueueContext);

