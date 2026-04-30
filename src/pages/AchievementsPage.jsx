import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStreaks } from '../context/StreakContext';
import { ACHIEVEMENTS } from '../utils/constants';
import { elapsedMs, msToDays, getLongestRun } from '../utils/helpers';
import styles from './AchievementsPage.module.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } };

export default function AchievementsPage() {
  const { streaks } = useStreaks();

  const earned = useMemo(() => {
    const set = new Set();

    if (streaks.length > 0) set.add('first_streak');

    const runningCount = streaks.filter((s) => s.status === 'running').length;
    if (runningCount >= 5) set.add('five_active');

    streaks.forEach((s) => {
      const longestDays = msToDays(getLongestRun(s));
      if (longestDays >= 7) set.add('week_warrior');
      if (longestDays >= 30) set.add('month_master');
      if (longestDays >= 100) set.add('century_club');
    });

    // Perfect week: all streaks running for at least 7 days
    if (streaks.length > 0) {
      const allRunning7 = streaks.every(
        (s) => s.status === 'running' && msToDays(elapsedMs(s.startedAt)) >= 7
      );
      if (allRunning7) set.add('perfect_week');
    }

    return set;
  }, [streaks]);

  const earnedCount = earned.size;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className={styles.page}>
      <motion.h1 className={styles.heading} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Achievements
      </motion.h1>

      <p className={styles.subtitle}>{earnedCount} of {totalCount} badges earned</p>

      <div className={styles.progressBar}>
        <motion.div
          className={styles.progressFill}
          initial={{ width: 0 }}
          animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <motion.div className={styles.grid} variants={container} initial="hidden" animate="show">
        {ACHIEVEMENTS.map((a) => {
          const isEarned = earned.has(a.id);
          return (
            <motion.div
              key={a.id}
              className={`${styles.badge} ${isEarned ? styles.earned : styles.locked}`}
              variants={item}
              whileHover={{ scale: 1.05 }}
            >
              <span className={styles.emoji}>{a.emoji}</span>
              <h3 className={styles.badgeTitle}>{a.title}</h3>
              <p className={styles.badgeDesc}>{a.description}</p>
              {isEarned ? (
                <span className={styles.earnedLabel}>✓ Earned</span>
              ) : (
                <span className={styles.lockedLabel}>🔒 Locked</span>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
