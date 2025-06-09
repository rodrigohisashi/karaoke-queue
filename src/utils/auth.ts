import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, googleProvider, db, ADMIN_PATH } from '../firebase/config';
import { UserRole, UserPermission, RolePermissions } from '../types';

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
    const userRef = ref(db, `${ADMIN_PATH}/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      // If user is not in the database, add them as a regular USER
      await set(userRef, {
        role: UserRole.USER,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        permissions: RolePermissions[UserRole.USER],
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
  if (!user) return { role: UserRole.USER, permissions: RolePermissions[UserRole.USER] };

  try {
    const userRef = ref(db, `${ADMIN_PATH}/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        role: data.role || UserRole.USER,
        permissions: data.permissions || RolePermissions[UserRole.USER]
      };
    }
    
    return { role: UserRole.USER, permissions: RolePermissions[UserRole.USER] };
  } catch (error) {
    console.error('Error getting user role:', error);
    return { role: UserRole.USER, permissions: RolePermissions[UserRole.USER] };
  }
};

// Set user role (only callable by admins)
export const setUserRole = async (userId: string, role: UserRole) => {
  try {
    const userRef = ref(db, `${ADMIN_PATH}/${userId}`);
    const snapshot = await get(userRef);
    const currentData = snapshot.val() || {};
    
    await set(userRef, {
      ...currentData,
      role,
      permissions: RolePermissions[role],
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
};

// Check if user has specific permission
export const hasPermission = (permissions: UserPermission[], permission: UserPermission): boolean => {
  return permissions.includes(permission);
};

