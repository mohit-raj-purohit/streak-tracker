import { useState, useEffect } from 'react';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const hideTimer = setTimeout(() => setVisible(false), 1600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.splash} ${fading ? styles.fadeOut : ''}`}>
      <div className={styles.iconWrap}>
        <svg viewBox="0 0 512 512" className={styles.icon}>
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c9a84c" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx="108" fill="url(#sg)" />
          <path d="M280 80L180 260h80l-40 172 140-200h-90z" fill="#fff" fillOpacity="0.95" />
        </svg>
      </div>
      <h1 className={styles.title}>Streak Tracker</h1>
      <p className={styles.tagline}>Build habits. Track progress.</p>
    </div>
  );
}
