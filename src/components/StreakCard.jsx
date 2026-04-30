import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay } from 'react-icons/fa';
import { useStreaks } from '../context/StreakContext';
import { elapsedMs, msToDays, formatDate } from '../utils/helpers';
import GlassButton from './GlassButton';
import styles from './StreakCard.module.css';

export default function StreakCard({ streak, onOpen }) {
  const { startStreak } = useStreaks();
  const isRunning = streak.status === 'running';

  const [dayCount, setDayCount] = useState(() =>
    isRunning ? msToDays(elapsedMs(streak.startedAt)) : 0
  );

  useEffect(() => {
    if (!isRunning) { setDayCount(0); return; }
    const update = () => setDayCount(msToDays(elapsedMs(streak.startedAt)));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [isRunning, streak.startedAt]);

  const handleStart = (e) => {
    e.stopPropagation();
    startStreak(streak.id);
  };

  // Goal progress
  const hasGoal = streak.goal?.days > 0;
  const goalProgress = hasGoal ? Math.min(100, Math.round((dayCount / streak.goal.days) * 100)) : 0;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen(streak.id)}
      role="button"
      tabIndex={0}
      aria-label={`${streak.title}: ${isRunning ? `${dayCount} days` : 'idle'}${hasGoal ? `, ${goalProgress}% of goal` : ''}`}
    >
      <div className={styles.tile} style={{ background: streak.color }}>
        {/* Goal progress ring — top right corner */}
        {hasGoal && isRunning && (
          <div className={styles.progressRing}>
            <ProgressCircle percent={goalProgress} />
            <span className={styles.progressText}>{goalProgress}%</span>
          </div>
        )}

        {isRunning ? (
          <>
            <motion.span
              className={styles.count}
              key={dayCount}
              initial={{ scale: 1.08, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {dayCount}
            </motion.span>
            <span className={styles.unit}>
              {dayCount === 1 ? 'day' : 'days'}
              {hasGoal && (
                <span className={styles.goalLabel}>
                  {' '}/ {streak.goal.days}d
                  {goalProgress < 100
                    ? ` · ${streak.goal.days - dayCount}d left`
                    : ' · Goal reached 🎉'}
                </span>
              )}
            </span>
          </>
        ) : (
          <GlassButton
            label="Start"
            icon={<FaPlay style={{ fontSize: 11 }} />}
            onClick={handleStart}
            aria-label="Start streak"
            className={styles.startBtn}
            color={streak.color}
          />
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{streak.title}</p>
        <p className={styles.sub}>
          {isRunning
            ? `Started ${formatDate(streak.startedAt?.split('T')[0])}`
            : 'Tap to start'}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * SVG circular progress indicator.
 * Renders a ring that fills clockwise based on percent.
 */
function ProgressCircle({ percent, size = 36, strokeWidth = 3 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={styles.progressSvg}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#fff"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
    </svg>
  );
}
