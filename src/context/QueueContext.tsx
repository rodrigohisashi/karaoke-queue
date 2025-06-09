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
    get
} from 'firebase/database';
import { db as rtdb } from '../firebase/config';
import { QueueContextType, Singer } from '../types';
import { subscribeToAuth, signInWithGoogle, signOutUser } from '../utils/auth';
import { User } from 'firebase/auth';

type ViewMode = 'current' | 'completed';

const QueueContext = createContext<QueueContextType>({
    queue: [],
    currentSingerIndex: 0,
    addToQueue: async () => {},
    removeSinger: async () => {},
    markAsSung: async () => {},
    userName: null,
    setUserName: () => {},
    user: null,
    signInWithGoogle: async () => {},
    signOutUser: async () => {},
    viewMode: 'current',
    setViewMode: () => {},
    completedSongs: []
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

    // Persist userName into localStorage
    useEffect(() => {
        if (userName) {
            localStorage.setItem('karaokeUserName', userName);
        }
    }, [userName]);

    // Listen for Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = subscribeToAuth((firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser && firebaseUser.displayName) {
                setUserName(firebaseUser.displayName);
            }
        });
        return () => unsubscribe();
    }, []);

    //
    // ─── LISTEN TO /queue AND REBUILD + SORT EVERYTHING ─────────────────────────────
    //
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
                    computed_times_sang: 0
                };
            });

            // Separate completed and current songs
            const completed = rawList.filter(song => song.completed);
            setCompletedSongs(completed.sort((a, b) => b.timestamp - a.timestamp));

            // Filter out completed songs for the current queue
            const currentSongs = rawList.filter(song => !song.completed);

            // Count how many times each user has "completed"
            const counts: Record<string, number> = {};
            for (const e of rawList) {
                if (e.completed) {
                    counts[e.name] = (counts[e.name] || 0) + 1;
                }
            }

            // Annotate each entry with its user's sung-count
            for (const entry of currentSongs) {
                entry.computed_times_sang = counts[entry.name] || 0;
            }

            // Group entries by user
            const byUser: Record<string, Singer[]> = {};
            currentSongs.forEach(entry => {
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

            // Now interleaved[] is the final queue
            setQueue(interleaved);

            // Find first not-completed
            const nextIdx = interleaved.findIndex(e => !e.completed);
            setCurrentSingerIndex(nextIdx !== -1 ? nextIdx : -1);
        });

        return () => unsubscribe();
    }, [userName]);


    //
    // ─── ADD A SONG TO THE QUEUE ─────────────────────────────────────────────────────────
    //
    const addToQueue = async (song: string, artist?: string) => {
        if (!userName) return;

        // Simply push a new node under /queue
        const queueRef = ref(rtdb, 'queue');
        const newRef = push(queueRef);
        await set(newRef, {
            name: userName,
            song,
            artist: artist || null,
            timestamp: serverTimestamp(),
            completed: false
        });
    };

    //
    // ─── REMOVE A SONG FROM THE QUEUE ────────────────────────────────────────────────────
    //
    const removeSinger = async (id: string) => {
        await remove(ref(rtdb, `queue/${id}`));
    };

    //
    // ─── MARK "SANG" ──────────────────────────────────────────────────────────────────────
    //
    const markAsSung = async (id: string) => {
        // 1) Flip completed = true on /queue/{id}
        const entryRef = ref(rtdb, `queue/${id}`);
        await runTransaction(entryRef, (currentData) => {
            if (!currentData) return null;
            return {
                ...currentData,
                completed: true
            };
        });
        // No separate /users counter: we'll always recompute "how many times each user sang"
        // by re-scanning all entries in /queue. That keeps this simple.
    };

    return (
        <QueueContext.Provider
            value={{
                queue,
                currentSingerIndex,
                addToQueue,
                removeSinger,
                markAsSung,
                userName,
                setUserName,
                user,
                signInWithGoogle,
                signOutUser,
                viewMode,
                setViewMode,
                completedSongs
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => useContext(QueueContext);

