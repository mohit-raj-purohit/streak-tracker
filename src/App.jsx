import { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import Navbar from './components/Navbar';
import ReminderBanner from './components/ReminderBanner';
import FloatingWidget from './components/FloatingWidget';
import SplashScreen from './components/SplashScreen';
import Dashboard from './pages/Dashboard';
import StatsPage from './pages/StatsPage';
import CalendarPage from './pages/CalendarPage';
import AchievementsPage from './pages/AchievementsPage';
import StreakDetail from './pages/StreakDetail';
import AddStreakModal from './components/AddStreakModal';
import { useStreaks } from './context/StreakContext';

const pageComponents = {
  dashboard: Dashboard,
  stats: StatsPage,
  calendar: CalendarPage,
  achievements: AchievementsPage,
};

/**
 * Navigate with CSS View Transitions.
 * Uses flushSync so React commits the DOM update synchronously
 * inside the transition callback — this is what makes it work.
 */
function navigateWithTransition(direction, updateFn) {
  if (!document.startViewTransition) {
    updateFn();
    return;
  }

  document.documentElement.dataset.vtDirection = direction;

  document.startViewTransition(() => {
    flushSync(() => {
      updateFn();
    });
  });
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [detailStreakId, setDetailStreakId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const { editStreak } = useStreaks();

  const handlePageChange = useCallback((page) => {
    navigateWithTransition('forward', () => {
      setDetailStreakId(null);
      setCurrentPage(page);
    });
  }, []);

  const openStreak = useCallback((id) => {
    navigateWithTransition('forward', () => {
      setDetailStreakId(id);
      setCurrentPage('detail');
    });
  }, []);

  const goBack = useCallback(() => {
    navigateWithTransition('back', () => {
      setDetailStreakId(null);
      setCurrentPage('dashboard');
    });
  }, []);

  const handleEditFromDetail = (streak) => {
    setEditData(streak);
    setEditModalOpen(true);
  };

  const handleEditSave = (form) => {
    if (editData) editStreak(editData.id, form);
    setEditData(null);
  };

  const showNavbar = currentPage !== 'detail';
  const isDetail = currentPage === 'detail' && detailStreakId;
  const PageComponent = isDetail ? null : pageComponents[currentPage];

  return (
    <>
      <SplashScreen />
      {showNavbar && (
        <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      )}
      <main className="app-container">
        {showNavbar && <ReminderBanner />}

        <div className="vt-page-content">
          {isDetail ? (
            <StreakDetail
              streakId={detailStreakId}
              onBack={goBack}
              onEdit={handleEditFromDetail}
            />
          ) : (
            PageComponent && <PageComponent onOpenStreak={openStreak} />
          )}
        </div>
      </main>
      {showNavbar && <FloatingWidget />}

      <AddStreakModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditData(null); }}
        onSave={handleEditSave}
        editData={editData}
      />
    </>
  );
}
