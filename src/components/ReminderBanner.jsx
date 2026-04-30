import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes } from 'react-icons/fa';
import { useStreaks } from '../context/StreakContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { REMINDERS_KEY } from '../utils/constants';
import styles from './ReminderBanner.module.css';

export default function ReminderBanner() {
  const { streaks } = useStreaks();
  const [reminderTime, setReminderTime] = useLocalStorage(REMINDERS_KEY, '20:00');
  const [dismissed, setDismissed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const idle = streaks.filter((s) => s.status === 'idle');
  const shouldShow = idle.length > 0 && !dismissed;

  // Browser notification
  useEffect(() => {
    if (!reminderTime || Notification.permission === 'denied') return;

    const checkTime = () => {
      const now = new Date();
      const [h, m] = reminderTime.split(':').map(Number);
      if (now.getHours() === h && now.getMinutes() === m && idle.length > 0) {
        if (Notification.permission === 'granted') {
          new Notification('Streak Tracker Reminder', {
            body: `You have ${idle.length} idle streak${idle.length > 1 ? 's' : ''} waiting to start!`,
            icon: '/favicon.ico',
          });
        }
      }
    };

    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [reminderTime, idle.length]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.banner}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className={styles.content}>
          <FaBell className={styles.icon} />
          <span>
            {idle.length} streak{idle.length > 1 ? 's' : ''} idle — ready to start
          </span>
        </div>
        <div className={styles.actions}>
          <button onClick={() => setShowSettings(!showSettings)} className={styles.settingsBtn}>
            ⏰ {reminderTime}
          </button>
          <button onClick={() => setDismissed(true)} className={styles.closeBtn} aria-label="Dismiss reminder">
            <FaTimes />
          </button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              className={styles.settings}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <label>
                Reminder time:
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className={styles.timeInput}
                />
              </label>
              <button onClick={requestPermission} className={styles.permBtn}>
                Enable notifications
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
