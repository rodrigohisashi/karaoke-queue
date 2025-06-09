import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db, USERS_PATH } from '../firebase/config';
import { UserRole, UserPermission } from '../types';
import { useQueue } from '../context/QueueContext';
import { Shield, ShieldCheck, ShieldX, Loader2 } from 'lucide-react';

interface UserData {
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
  lastUpdated?: number;
}

const AdminPanel: React.FC = () => {
  const { hasPermission } = useQueue();
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usersRef = ref(db, USERS_PATH);
    const unsubscribe = onValue(usersRef, (snapshot) => {
      try {
        const data = snapshot.val() || {};
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      setError('Failed to load users');
      console.error('Error loading users:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRoleChange = async (userId: string, isAdmin: boolean) => {
    try {
      const userRef = ref(db, `${USERS_PATH}/${userId}`);
      await update(userRef, {
        isAdmin,
        lastUpdated: Date.now()
      });

      setUsers(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          isAdmin,
          lastUpdated: Date.now()
        }
      }));
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  if (!hasPermission(UserPermission.REORDER_QUEUE)) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <ShieldX className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to access the admin panel.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <ShieldX className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Admin Panel</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(users).map(([userId, userData]) => (
                <tr key={userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        {userData.photoURL ? (
                          <img
                            src={userData.photoURL}
                            alt={userData.displayName}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {userData.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {userData.displayName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {userData.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {userData.isAdmin ? (
                        <ShieldCheck className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <Shield className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {userData.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {userData.lastUpdated
                      ? new Date(userData.lastUpdated).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRoleChange(
                        userId,
                        !userData.isAdmin
                      )}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        userData.isAdmin
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                    >
                      {userData.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 