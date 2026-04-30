import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import styles from './GlassModal.module.css';

/**
 * Reusable glass modal with layered glass header.
 *
 * Props:
 *  - open       (bool)     Visibility
 *  - onClose    (fn)       Close handler
 *  - title      (string)   Header title
 *  - children   (node)     Modal body content
 *  - size       'sm' | 'md' | 'lg'  (default: 'md')
 *  - sheet      (bool)     Bottom-sheet on mobile (default: true)
 */
export default function GlassModal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  sheet = true,
}) {
  const sizeClass =
    size === 'sm' ? styles.sm :
    size === 'lg' ? styles.lg :
    styles.md;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`${styles.backdrop} ${sheet ? styles.sheetMode : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            className={`${styles.modal} ${sizeClass} ${sheet ? styles.sheet : ''}`}
            initial={{ opacity: 0, y: sheet ? 80 : 12, scale: sheet ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: sheet ? 80 : 12, scale: sheet ? 1 : 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Shine reflection on modal surface */}
            <span className={styles.shine} aria-hidden="true" />

            {/* Glass header */}
            {title && (
              <GlassModalHeader title={title} onClose={onClose} />
            )}

            {/* Body */}
            <div className={styles.body}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Glass modal header — distinct elevated glass strip.
 */
export function GlassModalHeader({ title, onClose }) {
  return (
    <div className={styles.header}>
      {/* Header shine */}
      <span className={styles.headerShine} aria-hidden="true" />

      <h2 className={styles.headerTitle}>{title}</h2>
      {onClose && (
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}
