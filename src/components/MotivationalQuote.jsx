import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MOTIVATIONAL_QUOTES } from '../utils/constants';
import styles from './MotivationalQuote.module.css';

export default function MotivationalQuote() {
  const quote = useMemo(() => {
    // Pick a quote based on the day so it changes daily
    const dayIndex = Math.floor(Date.now() / 86400000) % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[dayIndex];
  }, []);

  return (
    <motion.div
      className={styles.banner}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <span className={styles.emoji}>💡</span>
      <p className={styles.text}>{quote}</p>
    </motion.div>
  );
}
