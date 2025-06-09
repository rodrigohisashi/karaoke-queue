import React, { useState, useEffect } from 'react';
import { QueueProvider } from './context/QueueContext';
import Header from './components/Header';
import QueueList from './components/QueueList';
import AddSongForm from './components/AddSongForm';
import YourPosition from './components/YourPosition';
import JoinSession from './components/JoinSession';
import AdminPanel from './components/AdminPanel';
import { useQueue } from './context/QueueContext';
import { UserPermission } from './types';
import { auth } from './firebase/config';

const KaraokeApp: React.FC = () => {
  const { userName, hasPermission } = useQueue();
  const [activeTab, setActiveTab] = useState<'queue' | 'admin'>('queue');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthenticated || !userName) {
    return <JoinSession />;
  }

  const isAdmin = hasPermission(UserPermission.REORDER_QUEUE);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      
      {isAdmin && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="container mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('queue')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'queue'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Queue
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Admin Panel
              </button>
            </div>
          </nav>
        </div>
      )}
      
      <main className="flex-1 container mx-auto px-4 pt-6 pb-24">
        {activeTab === 'queue' ? (
          <>
            <YourPosition />
            <QueueList />
          </>
        ) : (
          <AdminPanel />
        )}
      </main>
      
      {activeTab === 'queue' && <AddSongForm />}
    </div>
  );
};

function App() {
  return (
    <QueueProvider>
      <KaraokeApp />
    </QueueProvider>
  );
}

export default App;