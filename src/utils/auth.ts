import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, googleProvider, db, USERS_PATH } from '../firebase/config';
import { UserRole, UserPermission } from '../types';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Check and set user role after successful sign in
    await checkAndSetUserRole(result.user);
    return result;
  } catch (error) {
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Check user role when auth state changes
      await checkAndSetUserRole(user);
    }
    callback(user);
  });
};

// Check if user has a role and set it if not
const checkAndSetUserRole = async (user: User) => {
  try {
    const userRef = ref(db, `${USERS_PATH}/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      // If user is not in the database, add them as a regular USER
      await set(userRef, {
        isAdmin: false,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastUpdated: Date.now()
      });
    }
  } catch (error) {
    console.error('Error checking user role:', error);
  }
};

// Get current user's role and permissions
export const getUserRoleAndPermissions = async (): Promise<{ role: UserRole; permissions: UserPermission[] }> => {
  const user = auth.currentUser;
  if (!user) return { role: UserRole.USER, permissions: [] };

  try {
    const userRef = ref(db, `${USERS_PATH}/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const isAdmin = data.isAdmin || false;
      return {
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
        permissions: isAdmin ? Object.values(UserPermission) : []
      };
    }
    
    return { role: UserRole.USER, permissions: [] };
  } catch (error) {
    console.error('Error getting user role:', error);
    return { role: UserRole.USER, permissions: [] };
  }
};

// Set user role (only callable by admins)
export const setUserRole = async (userId: string, isAdmin: boolean) => {
  try {
    const userRef = ref(db, `${USERS_PATH}/${userId}`);
    const snapshot = await get(userRef);
    const currentData = snapshot.val() || {};
    
    await set(userRef, {
      ...currentData,
      isAdmin,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
};

// Check if user has specific permission
export const hasPermission = (permissions: UserPermission[], permission: UserPermission): boolean => {
  // If user has any permissions, they have all permissions (admin)
  return permissions.length > 0;
};

