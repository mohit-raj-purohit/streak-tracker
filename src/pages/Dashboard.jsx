import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch, FaFilter, FaTrash } from 'react-icons/fa';
import { useStreaks } from '../context/StreakContext';
import StreakCard from '../components/StreakCard';
import AddStreakModal from '../components/AddStreakModal';
import QuickStats from '../components/QuickStats';
import MotivationalQuote from '../components/MotivationalQuote';
import ConfirmDialog from '../components/ConfirmDialog';
import GlassButton from '../components/GlassButton';
import { CATEGORIES } from '../utils/constants';
import styles from './Dashboard.module.css';

export default function Dashboard({ onOpenStreak }) {
  const { streaks, addStreak, editStreak, reorderStreaks, deleteAllStreaks } = useStreaks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const filtered = useMemo(() => {
    let result = [...streaks];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'all') {
      result = result.filter((s) => s.category === filterCategory);
    }
    return result;
  }, [streaks, search, filterCategory]);

  const handleSave = (form) => {
    if (editData) {
      editStreak(editData.id, form);
    } else {
      addStreak(form);
    }
    setEditData(null);
  };

  const handleDragStart = (index) => { dragItem.current = index; };
  const handleDragEnter = (index) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      reorderStreaks(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className={styles.page}>
      <MotivationalQuote />
      <QuickStats />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search streaks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="Search streaks"
          />
        </div>

        <div className={styles.filterWrap}>
          <FaFilter className={styles.filterIcon} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by category"
          >
            <option value="all">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <GlassButton
          label="New Streak"
          icon={<FaPlus />}
          onClick={() => { setEditData(null); setModalOpen(true); }}
          className={styles.addBtn}
        />
      </div>

      {/* Streak grid */}
      {filtered.length === 0 ? (
        <motion.div className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className={styles.emptyIcon}>🎯</p>
          <p className={styles.emptyTitle}>
            {streaks.length === 0 ? 'No streaks yet' : 'No matches found'}
          </p>
          <p className={styles.emptyDesc}>
            {streaks.length === 0
              ? 'Create your first streak and start building habits!'
              : 'Try adjusting your search or filter.'}
          </p>
          {streaks.length === 0 && (
            <GlassButton
              label="Create Streak"
              icon={<FaPlus />}
              onClick={() => { setEditData(null); setModalOpen(true); }}
            />
          )}
        </motion.div>
      ) : (
        <div className={styles.grid}>
          <AnimatePresence>
            {filtered.map((streak, index) => (
              <div
                key={streak.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <StreakCard streak={streak} onOpen={onOpenStreak} />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete all — tucked at the bottom, not prominent */}
      {streaks.length > 0 && (
        <button
          className={styles.dangerLink}
          onClick={() => setConfirmDeleteAll(true)}
        >
          <FaTrash style={{ fontSize: 10 }} /> Delete all streaks
        </button>
      )}

      <AddStreakModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />

      <ConfirmDialog
        open={confirmDeleteAll}
        title="Delete All Streaks"
        message={`This will permanently delete all ${streaks.length} streaks. This cannot be undone.`}
        confirmText="Delete All"
        destructive
        onConfirm={() => { deleteAllStreaks(); setConfirmDeleteAll(false); }}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
}
