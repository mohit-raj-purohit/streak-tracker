import { useState, useEffect } from 'react';
import { CATEGORIES, COLORS, ICONS } from '../utils/constants';
import GlassModal from './GlassModal';
import GlassButton from './GlassButton';
import styles from './AddStreakModal.module.css';

const defaultForm = {
  title: '',
  category: 'personal',
  notes: '',
  color: '#3b82f6',
  icon: 'FaFire',
};

export default function AddStreakModal({ isOpen, onClose, onSave, editData }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        category: editData.category || 'personal',
        notes: editData.notes || '',
        color: editData.color || '#3b82f6',
        icon: editData.icon || 'FaFire',
      });
    } else {
      setForm(defaultForm);
    }
  }, [editData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <GlassModal
      open={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Streak' : 'New Streak'}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Title */}
        <div className={styles.field}>
          <label htmlFor="streak-title">Title</label>
          <input
            id="streak-title"
            type="text"
            placeholder="e.g., Morning Gym"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            autoFocus
            required
          />
        </div>

        {/* Category */}
        <div className={styles.field}>
          <label htmlFor="streak-category">Category</label>
          <select
            id="streak-category"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className={styles.field}>
          <label htmlFor="streak-notes">Notes</label>
          <textarea
            id="streak-notes"
            placeholder="Optional notes..."
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
          />
        </div>

        {/* Color picker */}
        <div className={styles.field}>
          <label>Color</label>
          <div className={styles.colorGrid}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorSwatch} ${form.color === c ? styles.selected : ''}`}
                style={{ background: c }}
                onClick={() => update('color', c)}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div className={styles.field}>
          <label>Icon</label>
          <div className={styles.iconGrid}>
            {ICONS.map((ic) => {
              const Comp = ic.component;
              return (
                <button
                  key={ic.name}
                  type="button"
                  className={`${styles.iconOption} ${form.icon === ic.name ? styles.selected : ''}`}
                  onClick={() => update('icon', ic.name)}
                  aria-label={`Select icon ${ic.name}`}
                  style={form.icon === ic.name ? { color: form.color, borderColor: form.color } : {}}
                >
                  <Comp />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <GlassButton
            type="button"
            label="Cancel"
            variant="ghost"
            onClick={onClose}
            fullWidth
          />
          <GlassButton
            type="submit"
            label={editData ? 'Save Changes' : 'Create Streak'}
            color={form.color}
            fullWidth
          />
        </div>
      </form>
    </GlassModal>
  );
}
