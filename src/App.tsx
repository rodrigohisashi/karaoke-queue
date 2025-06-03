import React from 'react';
import { QueueProvider } from './context/QueueContext';
import Header from './components/Header';
import QueueList from './components/QueueList';
import AddSongForm from './components/AddSongForm';
import YourPosition from './components/YourPosition';
import JoinSession from './components/JoinSession';
import { useQueue } from './context/QueueContext';

const KaraokeApp: React.FC = () => {
  const { userName } = useQueue();

  if (!userName) {
    return <JoinSession />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-6 pb-24">
        <YourPosition />
        <QueueList />
      </main>
      
      <AddSongForm />
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