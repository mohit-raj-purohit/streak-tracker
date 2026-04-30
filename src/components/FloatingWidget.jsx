import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaPlay, FaTimes } from 'react-icons/fa';
import { useStreaks } from '../context/StreakContext';
import { ICONS } from '../utils/constants';
import styles from './FloatingWidget.module.css';

export default function FloatingWidget() {
  const { streaks, startStreak } = useStreaks();
  const [open, setOpen] = useState(false);

  const idle = streaks.filter((s) => s.status === 'idle');

  if (idle.length === 0) return null;

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className={styles.panelHeader}>
              <span>Quick Start</span>
              <button onClick={() => setOpen(false)} aria-label="Close widget">
                <FaTimes />
              </button>
            </div>
            <div className={styles.list}>
              {idle.map((s) => {
                const IconComp = ICONS.find((i) => i.name === s.icon)?.component || FaBolt;
                return (
                  <motion.button
                    key={s.id}
                    className={styles.item}
                    onClick={() => startStreak(s.id)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={styles.itemIcon} style={{ color: s.color }}>
                      <IconComp />
                    </span>
                    <span className={styles.itemTitle}>{s.title}</span>
                    <FaPlay className={styles.playIcon} style={{ color: s.color }} />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={styles.fab}
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className={styles.fabBadge}>{idle.length}</span>
        <FaBolt />
      </motion.button>
    </div>
  );
}
