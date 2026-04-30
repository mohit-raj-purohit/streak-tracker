import { motion, AnimatePresence } from 'framer-motion';
import styles from './ConfirmDialog.module.css';

/**
 * iOS-style confirm dialog using glass surface.
 * Kept as its own component (not GlassModal) because the layout
 * is fundamentally different — no scrollable body, split action buttons.
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
        >
          <motion.div
            className={styles.dialog}
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            {/* Shine */}
            <span className={styles.shine} aria-hidden="true" />

            <div className={styles.body}>
              <h3 id="confirm-title" className={styles.title}>{title}</h3>
              {message && <p className={styles.message}>{message}</p>}
            </div>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onCancel}>
                {cancelText}
              </button>
              <button
                className={`${styles.confirmBtn} ${destructive ? styles.destructive : ''}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
