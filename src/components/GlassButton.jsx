import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import styles from './GlassButton.module.css';

/**
 * Premium glass CTA button with animated light-sweep shine.
 *
 * Props:
 *  - label        (string)   Button text
 *  - icon         (element)  Optional leading icon
 *  - variant      'primary' | 'danger' | 'ghost'   (default: 'primary')
 *  - color        (string)   Custom accent color override
 *  - fullWidth    (bool)     Stretch to 100%
 *  - disabled     (bool)
 *  - className    (string)   Extra class
 *  - ...rest      Passed to <motion.button>
 */
const GlassButton = forwardRef(function GlassButton(
  { label, icon, variant = 'primary', color, fullWidth, disabled, className = '', ...rest },
  ref
) {
  const variantClass =
    variant === 'danger' ? styles.danger :
    variant === 'ghost'  ? styles.ghost  :
    styles.primary;

  return (
    <motion.button
      ref={ref}
      className={`${styles.btn} ${variantClass} ${fullWidth ? styles.full : ''} ${disabled ? styles.disabled : ''} ${className}`}
      style={color && variant === 'primary' ? { '--btn-accent': color } : undefined}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      {...rest}
    >
      {/* Shine sweep — pseudo-element via CSS */}
      <span className={styles.shine} aria-hidden="true" />

      {/* Content */}
      <span className={styles.content}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.label}>{label}</span>
      </span>
    </motion.button>
  );
});

export default GlassButton;
