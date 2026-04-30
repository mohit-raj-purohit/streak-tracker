import { useState, useCallback } from 'react';
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

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [detailStreakId, setDetailStreakId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const { editStreak } = useStreaks();

  const handlePageChange = useCallback((page) => {
    setDetailStreakId(null);
    setCurrentPage(page);
  }, []);

  const openStreak = useCallback((id) => {
    setDetailStreakId(id);
    setCurrentPage('detail');
  }, []);

  const goBack = useCallback(() => {
    setDetailStreakId(null);
    setCurrentPage('dashboard');
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
        <div>
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
