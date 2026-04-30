import { motion } from 'framer-motion';
import {
  FaSun, FaMoon, FaFileExport, FaFileImport, FaBolt,
  FaFire, FaChartBar, FaCalendarAlt, FaMedal,
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useStreaks } from '../context/StreakContext';
import { exportData, importData } from '../utils/helpers';
import styles from './Navbar.module.css';

const pages = [
  { id: 'dashboard', label: 'Streaks', icon: FaFire },
  { id: 'stats', label: 'Stats', icon: FaChartBar },
  { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
  { id: 'achievements', label: 'Badges', icon: FaMedal },
];

export default function Navbar({ currentPage, onPageChange }) {
  const { theme, toggleTheme } = useTheme();
  const { streaks, importStreaks } = useStreaks();

  const handleExport = () => exportData(streaks);

  const handleImport = async () => {
    try {
      const data = await importData();
      if (window.confirm(`Import ${data.length} streaks? This will merge with existing data.`)) {
        importStreaks(data);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      {/* Desktop top bar */}
      <nav className={`${styles.topBar} vt-navbar-top`}>
        <div className={styles.topInner}>
          <div className={styles.brand}>
            <FaBolt className={styles.logo} />
            <span className={styles.title}>Streak Tracker</span>
          </div>

          <div className={styles.desktopTabs}>
            {pages.map((p) => (
              <button
                key={p.id}
                className={`${styles.desktopTab} ${currentPage === p.id ? styles.active : ''}`}
                onClick={() => onPageChange(p.id)}
              >
                {p.label}
                {currentPage === p.id && (
                  <motion.div
                    className={styles.indicator}
                    layoutId="nav-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <button onClick={handleImport} className={styles.iconBtn} aria-label="Import data">
              <FaFileImport />
            </button>
            <button onClick={handleExport} className={styles.iconBtn} aria-label="Export data">
              <FaFileExport />
            </button>
            <button onClick={toggleTheme} className={styles.iconBtn} aria-label="Toggle theme">
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className={`${styles.bottomBar} vt-navbar-bottom`}>
        {pages.map((p) => {
          const Icon = p.icon;
          const isActive = currentPage === p.id;
          return (
            <button
              key={p.id}
              className={`${styles.bottomTab} ${isActive ? styles.bottomActive : ''}`}
              onClick={() => onPageChange(p.id)}
              aria-label={p.label}
            >
              <Icon className={styles.bottomIcon} />
              <span className={styles.bottomLabel}>{p.label}</span>
              {isActive && <motion.div className={styles.bottomDot} layoutId="bottom-dot" />}
            </button>
          );
        })}
        <button className={styles.bottomTab} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <FaSun className={styles.bottomIcon} /> : <FaMoon className={styles.bottomIcon} />}
          <span className={styles.bottomLabel}>Theme</span>
        </button>
      </nav>
    </>
  );
}
