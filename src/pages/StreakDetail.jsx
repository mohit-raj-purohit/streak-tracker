import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft, FaPlay, FaUndo, FaEdit, FaTrash, FaFire,
  FaChevronRight, FaHistory, FaBullseye, FaChartBar, FaBell, FaCog,
  FaClock, FaCalendarAlt,
} from 'react-icons/fa';
import { useStreaks } from '../context/StreakContext';
import { ICONS } from '../utils/constants';
import {
  elapsedMs, formatDateTime, formatDurationShort,
  getLongestRun, msToDays,
} from '../utils/helpers';
import GlassButton from '../components/GlassButton';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from './StreakDetail.module.css';

const TIMER_TABS = [
  { id: 'hours', label: 'Hours' },
  { id: 'days', label: 'Days' },
  { id: 'weeks', label: 'Weeks' },
  { id: 'months', label: 'Months' },
  { id: 'years', label: 'Years' },
];

function decompose(totalSec, view) {
  const s = Math.max(0, Math.floor(totalSec));
  if (view === 'hours') {
    return [
      { value: Math.floor(s / 3600), unit: 'Hours' },
      { value: Math.floor((s % 3600) / 60), unit: 'Minutes' },
      { value: s % 60, unit: 'Seconds' },
    ];
  }
  if (view === 'days') {
    return [
      { value: Math.floor(s / 86400), unit: 'Days' },
      { value: Math.floor((s % 86400) / 3600), unit: 'Hours' },
      { value: Math.floor((s % 3600) / 60), unit: 'Min' },
      { value: s % 60, unit: 'Sec' },
    ];
  }
  if (view === 'weeks') {
    return [
      { value: Math.floor(s / 604800), unit: 'Weeks' },
      { value: Math.floor((s % 604800) / 86400), unit: 'Days' },
      { value: Math.floor((s % 86400) / 3600), unit: 'Hours' },
      { value: Math.floor((s % 3600) / 60), unit: 'Min' },
    ];
  }
  if (view === 'months') {
    const totalDays = s / 86400;
    const months = Math.floor(totalDays / 30.44);
    const remDays = Math.floor(totalDays % 30.44);
    return [
      { value: months, unit: 'Months' },
      { value: remDays, unit: 'Days' },
      { value: Math.floor((s % 86400) / 3600), unit: 'Hours' },
      { value: Math.floor((s % 3600) / 60), unit: 'Min' },
    ];
  }
  const totalDays = s / 86400;
  const years = Math.floor(totalDays / 365.25);
  const rem = totalDays - years * 365.25;
  const months = Math.floor(rem / 30.44);
  const remDays = Math.floor(rem - months * 30.44);
  return [
    { value: years, unit: 'Years' },
    { value: months, unit: 'Months' },
    { value: remDays, unit: 'Days' },
    { value: Math.floor((s % 86400) / 3600), unit: 'Hours' },
  ];
}

function formatHours(ms) {
  const h = Math.floor(ms / 3600000);
  return `${h.toLocaleString()} hours`;
}

export default function StreakDetail({ streakId, onBack, onEdit }) {
  const { streaks, startStreak, resetStreak, resetStreakAt, updateStartDate, deleteStreak, editStreak } = useStreaks();
  const streak = streaks.find((s) => s.id === streakId);

  const [activeTab, setActiveTab] = useState('hours');
  const [now, setNow] = useState(Date.now());
  const [openSection, setOpenSection] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!streak) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={onBack}><FaArrowLeft /> Back</button>
        <p className={styles.notFound}>Streak not found.</p>
      </div>
    );
  }

  const isRunning = streak.status === 'running';
  const totalSec = isRunning ? Math.floor((now - new Date(streak.startedAt).getTime()) / 1000) : 0;
  const segments = decompose(totalSec, activeTab);
  const history = [...(streak.resetHistory || [])].reverse();
  const longestMs = getLongestRun(streak);
  const currentMs = isRunning ? elapsedMs(streak.startedAt) : 0;
  const totalRunMs = (streak.resetHistory || []).reduce((sum, h) => sum + h.durationMs, 0) + currentMs;
  const runCount = (streak.resetHistory || []).length + (isRunning ? 1 : 0);
  const avgMs = runCount > 0 ? totalRunMs / runCount : 0;

  const toggle = (section) => setOpenSection(openSection === section ? null : section);

  return (
    <div className={styles.page}>
      {/* Top bar — title absolutely centered */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>
          <FaArrowLeft /> <span className={styles.backLabel}>Counters</span>
        </button>
        <div className={styles.topCenter}>
          <span className={styles.topDot} style={{ background: streak.color }} />
          <span className={styles.topTitle}>{streak.title}</span>
        </div>
        <button className={styles.editLink} onClick={() => onEdit(streak)}>Edit</button>
      </div>

      {/* Timer */}
      <div className={styles.timerCard}>
        {isRunning ? (
          <>
            <div className={styles.tabs}>
              {TIMER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={activeTab === tab.id ? { color: streak.color, borderBottomColor: streak.color } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.timerDisplay}>
              {segments.map((seg) => (
                <div key={seg.unit} className={styles.segment}>
                  <motion.span
                    className={styles.segValue}
                    key={`${seg.unit}-${seg.value}`}
                    initial={{ y: -3, opacity: 0.6 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.1 }}
                  >
                    {String(seg.value).padStart(2, '0')}
                  </motion.span>
                  <span className={styles.segUnit}>{seg.unit}</span>
                </div>
              ))}
            </div>

            <GlassButton
              label="Reset Counter"
              icon={<FaUndo />}
              color={streak.color}
              fullWidth
              onClick={() => setConfirmReset(true)}
            />
          </>
        ) : (
          <div className={styles.idleState}>
            <p className={styles.idleText}>Streak is idle</p>
            <GlassButton
              label="Start Streak"
              icon={<FaPlay />}
              color={streak.color}
              onClick={() => startStreak(streak.id)}
            />
          </div>
        )}
      </div>

      {/* Menu rows */}
      <div className={styles.menuCard}>
        {/* All Resets */}
        <MenuRow icon={FaHistory} label="All Resets" color={streak.color}
          badge={history.length} isOpen={openSection === 'resets'} onTap={() => toggle('resets')} />
        <AnimatePresence>
          {openSection === 'resets' && (
            <ExpandWrap>
              {history.length === 0 ? (
                <p className={styles.expandEmpty}>No resets yet 🔥</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className={styles.resetItem}>
                    <span className={styles.resetDuration} style={{ color: streak.color }}>
                      {formatDurationShort(h.durationMs)}
                    </span>
                    <div className={styles.resetDates}>
                      <span>{formatDateTime(h.startedAt)}</span>
                      <span>→ {formatDateTime(h.resetAt)}</span>
                    </div>
                  </div>
                ))
              )}
              {/* Delete tucked here — intentional, not accidental */}
              <button
                className={styles.dangerLink}
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              >
                <FaTrash style={{ fontSize: 11 }} /> Delete this streak
              </button>
            </ExpandWrap>
          )}
        </AnimatePresence>

        <div className={styles.menuDivider} />

        {/* Goals */}
        <MenuRow icon={FaBullseye} label="Goals" color={streak.color}
          meta={streak.goal ? `${streak.goal.days}d` : null}
          showGear isOpen={openSection === 'goals'} onTap={() => toggle('goals')} />
        <AnimatePresence>
          {openSection === 'goals' && (
            <ExpandWrap>
              <GoalEditor
                goal={streak.goal}
                color={streak.color}
                currentDays={msToDays(currentMs)}
                onSave={(days) => editStreak(streak.id, { goal: days ? { days: Number(days) } : null })}
              />
            </ExpandWrap>
          )}
        </AnimatePresence>

        <div className={styles.menuDivider} />

        {/* Stats */}
        <MenuRow icon={FaChartBar} label="Stats" color={streak.color}
          showGear isOpen={openSection === 'stats'} onTap={() => toggle('stats')} />
        <AnimatePresence>
          {openSection === 'stats' && (
            <ExpandWrap>
              <div className={styles.statsGrid}>
                <StatCell value={history.length} label="Resets" color={streak.color} />
                <StatCell value={formatHours(currentMs)} label="Since started" />
                <StatCell value={formatHours(longestMs)} label="Longest Streak" />
                <StatCell value={formatHours(avgMs)} label="Average Streak" />
              </div>
            </ExpandWrap>
          )}
        </AnimatePresence>

        <div className={styles.menuDivider} />

        {/* Reminders */}
        <MenuRow icon={FaBell} label="Reminders" color={streak.color}
          meta={streak.reminderTime || null}
          showGear isOpen={openSection === 'reminders'} onTap={() => toggle('reminders')} />
        <AnimatePresence>
          {openSection === 'reminders' && (
            <ExpandWrap>
              <ReminderEditor
                reminderTime={streak.reminderTime}
                color={streak.color}
                onSave={(time) => editStreak(streak.id, { reminderTime: time || null })}
              />
            </ExpandWrap>
          )}
        </AnimatePresence>

        {/* Update Start Date — only for running streaks */}
        {isRunning && (
          <>
            <div className={styles.menuDivider} />
            <MenuRow icon={FaClock} label="Update Start Date" color={streak.color}
              meta={streak.startedAt ? new Date(streak.startedAt).toLocaleDateString() : null}
              showGear isOpen={openSection === 'startdate'} onTap={() => toggle('startdate')} />
            <AnimatePresence>
              {openSection === 'startdate' && (
                <ExpandWrap>
                  <StartDateEditor
                    startedAt={streak.startedAt}
                    color={streak.color}
                    onSave={(iso) => updateStartDate(streak.id, iso)}
                  />
                </ExpandWrap>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Reset at Specific Date — only for running streaks */}
        {isRunning && (
          <>
            <div className={styles.menuDivider} />
            <MenuRow icon={FaCalendarAlt} label="Reset at Date" color={streak.color}
              showGear isOpen={openSection === 'resetat'} onTap={() => toggle('resetat')} />
            <AnimatePresence>
              {openSection === 'resetat' && (
                <ExpandWrap>
                  <ResetAtDateEditor
                    startedAt={streak.startedAt}
                    color={streak.color}
                    onReset={(iso) => resetStreakAt(streak.id, iso)}
                  />
                </ExpandWrap>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Custom confirm dialogs */}
      <ConfirmDialog
        open={confirmReset}
        title="Reset Streak"
        message="The current run will be saved to history and the counter will restart."
        confirmText="Reset"
        destructive
        onConfirm={() => { resetStreak(streak.id); setConfirmReset(false); }}
        onCancel={() => setConfirmReset(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${streak.title}"?`}
        message="This action cannot be undone."
        confirmText="Delete"
        destructive
        onConfirm={() => { deleteStreak(streak.id); setConfirmDelete(false); onBack(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

/* ---- Reusable sub-components ---- */

function MenuRow({ icon: Icon, label, color, badge, meta, showGear, isOpen, onTap }) {
  return (
    <button className={styles.menuRow} onClick={onTap}>
      <span className={styles.menuIcon} style={{ background: `${color}18`, color }}>
        <Icon />
      </span>
      <span className={styles.menuLabel}>{label}</span>
      {badge != null && <span className={styles.menuBadge}>{badge}</span>}
      {meta && <span className={styles.menuMeta}>{meta}</span>}
      {showGear && <FaCog className={styles.menuGear} />}
      <FaChevronRight className={`${styles.menuArrow} ${isOpen ? styles.menuArrowOpen : ''}`} />
    </button>
  );
}

function ExpandWrap({ children }) {
  return (
    <motion.div
      className={styles.expandBody}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function StatCell({ value, label, color }) {
  return (
    <div className={styles.statsCell}>
      <span className={styles.statsBig} style={color ? { color } : {}}>{value}</span>
      <span className={styles.statsLabel}>{label}</span>
    </div>
  );
}

function GoalEditor({ goal, color, currentDays, onSave }) {
  const [days, setDays] = useState(goal?.days?.toString() || '');
  const [dirty, setDirty] = useState(false);

  const progress = goal?.days ? Math.min(100, Math.round((currentDays / goal.days) * 100)) : 0;

  const handleChange = (val) => { setDays(val); setDirty(true); };

  return (
    <div className={styles.editorBody}>
      {goal?.days && (
        <div className={styles.goalProgress}>
          <div className={styles.goalBar}>
            <div className={styles.goalFill} style={{ width: `${progress}%`, background: color }} />
          </div>
          <span className={styles.goalText}>{currentDays} / {goal.days} days ({progress}%)</span>
        </div>
      )}
      <div className={styles.editorRow}>
        <label className={styles.editorLabel}>Target days</label>
        <input
          type="number"
          className={styles.editorInput}
          placeholder="e.g. 30"
          value={days}
          onChange={(e) => handleChange(e.target.value)}
          min="1"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className={styles.editorActions}>
        <button
          className={styles.editorSave}
          style={{ background: dirty ? color : 'var(--bg-hover)', color: dirty ? '#fff' : 'var(--text-tertiary)' }}
          onClick={(e) => { e.stopPropagation(); onSave(days); setDirty(false); }}
          disabled={!dirty}
        >
          {goal ? 'Update Goal' : 'Set Goal'}
        </button>
        {goal && (
          <button
            className={styles.editorClear}
            onClick={(e) => { e.stopPropagation(); onSave(null); setDays(''); setDirty(false); }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function ReminderEditor({ reminderTime, color, onSave }) {
  const [time, setTime] = useState(reminderTime || '09:00');
  const [dirty, setDirty] = useState(false);

  const handleChange = (val) => { setTime(val); setDirty(true); };

  const requestPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  return (
    <div className={styles.editorBody}>
      <div className={styles.editorRow}>
        <label className={styles.editorLabel}>Reminder time</label>
        <input
          type="time"
          className={styles.editorInput}
          value={time}
          onChange={(e) => handleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className={styles.editorActions}>
        <button
          className={styles.editorSave}
          style={{ background: dirty ? color : 'var(--bg-hover)', color: dirty ? '#fff' : 'var(--text-tertiary)' }}
          onClick={(e) => { e.stopPropagation(); onSave(time); setDirty(false); }}
          disabled={!dirty}
        >
          {reminderTime ? 'Update Reminder' : 'Set Reminder'}
        </button>
        <button
          className={styles.editorClear}
          onClick={(e) => { e.stopPropagation(); requestPermission(); }}
        >
          Enable Notifications
        </button>
        {reminderTime && (
          <button
            className={styles.editorClear}
            onClick={(e) => { e.stopPropagation(); onSave(null); setDirty(false); }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function StartDateEditor({ startedAt, color, onSave }) {
  // Convert ISO to datetime-local format
  const toLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [value, setValue] = useState(toLocal(startedAt));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (val) => {
    setValue(val);
    setDirty(true);
    setError('');
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (!value) { setError('Please select a date and time'); return; }
    const newISO = new Date(value).toISOString();
    onSave(newISO);
    setDirty(false);
    setError('');
  };

  return (
    <div className={styles.editorBody}>
      <p className={styles.editorHint}>
        Change when this streak started. The timer will recalculate from the new date.
      </p>
      <div className={styles.editorRow}>
        <label className={styles.editorLabel}>Start date & time</label>
        <input
          type="datetime-local"
          className={styles.editorInput}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {error && <p className={styles.editorError}>{error}</p>}
      <div className={styles.editorActions}>
        <button
          className={styles.editorSave}
          style={{ background: dirty ? color : 'var(--bg-hover)', color: dirty ? '#fff' : 'var(--text-tertiary)' }}
          onClick={handleSave}
          disabled={!dirty}
        >
          Update Start Date
        </button>
        <button
          className={styles.editorClear}
          onClick={(e) => { e.stopPropagation(); setValue(toLocal(startedAt)); setDirty(false); setError(''); }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function ResetAtDateEditor({ startedAt, color, onReset }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (val) => {
    setValue(val);
    setError('');
  };

  const handleReset = (e) => {
    e.stopPropagation();
    if (!value) { setError('Please select a date and time'); return; }
    const resetMs = new Date(value).getTime();
    const startMs = new Date(startedAt).getTime();
    if (resetMs <= startMs) {
      setError('Reset date must be after the streak start date');
      return;
    }
    const resetISO = new Date(value).toISOString();
    onReset(resetISO);
    setValue('');
    setError('');
  };

  // Min value for the input — streak start date
  const toLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const minDate = toLocal(startedAt);

  return (
    <div className={styles.editorBody}>
      <p className={styles.editorHint}>
        Reset this streak at a specific date. The run duration will be calculated from the start date to the reset date. Must be after {new Date(startedAt).toLocaleDateString()}.
      </p>
      <div className={styles.editorRow}>
        <label className={styles.editorLabel}>Reset date & time</label>
        <input
          type="datetime-local"
          className={styles.editorInput}
          value={value}
          min={minDate}
          onChange={(e) => handleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {error && <p className={styles.editorError}>{error}</p>}
      <div className={styles.editorActions}>
        <button
          className={styles.editorSave}
          style={{ background: value ? color : 'var(--bg-hover)', color: value ? '#fff' : 'var(--text-tertiary)' }}
          onClick={handleReset}
          disabled={!value}
        >
          Reset at This Date
        </button>
      </div>
    </div>
  );
}
