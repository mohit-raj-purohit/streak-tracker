import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.splash}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className={styles.iconWrap}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg viewBox="0 0 512 512" className={styles.icon}>
              <defs>
                <linearGradient id="splash-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" />
                  <stop offset="100%" stopColor="#b8860b" />
                </linearGradient>
              </defs>
              <rect width="512" height="512" rx="108" fill="url(#splash-grad)" />
              <path
                d="M280 80L180 260h80l-40 172 140-200h-90z"
                fill="#fff"
                fillOpacity="0.95"
              />
            </svg>
          </motion.div>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Streak Tracker
          </motion.h1>

          <motion.p
            className={styles.tagline}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            Build habits. Track progress.
          </motion.p>

          <div className={styles.dots}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={styles.dot} style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
