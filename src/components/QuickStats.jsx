import { motion } from 'framer-motion';
import { FaFire, FaTrophy, FaPause, FaUndo } from 'react-icons/fa';
import { useStreaks } from '../context/StreakContext';
import styles from './QuickStats.module.css';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function QuickStats() {
  const { stats } = useStreaks();

  const cards = [
    { icon: FaFire, label: 'Running', value: stats.runningStreaks, color: '#30d158' },
    { icon: FaPause, label: 'Idle', value: stats.idleStreaks, color: '#ff9f0a' },
    { icon: FaTrophy, label: 'Best Run', value: `${stats.longestStreakDays}d`, color: '#0a84ff' },
    { icon: FaUndo, label: 'Resets', value: stats.totalResets, color: '#ff453a' },
  ];

  return (
    <motion.div className={styles.grid} variants={container} initial="hidden" animate="show">
      {cards.map((c) => (
        <motion.div
          key={c.label}
          className={styles.card}
          variants={item}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
        >
          <div className={styles.iconWrap} style={{ color: c.color, background: `${c.color}14` }}>
            <c.icon />
          </div>
          <div>
            <p className={styles.value}>{c.value}</p>
            <p className={styles.label}>{c.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
