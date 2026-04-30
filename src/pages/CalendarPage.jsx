import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, subMonths, addMonths, isSameDay, startOfDay,
  isBefore, isAfter, parseISO, subDays, addDays, endOfDay,
} from 'date-fns';
import { useStreaks } from '../context/StreakContext';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { ICONS } from '../utils/constants';
import styles from './CalendarPage.module.css';

function wasRunningOnDay(streak, dayMs) {
  const endOfDay = dayMs + 86400000;

  for (const h of (streak.resetHistory || [])) {
    const start = new Date(h.startedAt).getTime();
    const end = new Date(h.resetAt).getTime();
    if (start < endOfDay && end > dayMs) return true;
  }

  if (streak.status === 'running' && streak.startedAt) {
    const start = new Date(streak.startedAt).getTime();
    if (start < endOfDay) return true;
  }

  return false;
}

export default function CalendarPage() {
  const { streaks } = useStreaks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStreak, setSelectedStreak] = useState('all');
  const [popupDay, setPopupDay] = useState(null);

  // Compute the oldest streak date across all startedAt and resetHistory
  const oldestDate = useMemo(() => {
    let oldest = null;
    streaks.forEach((s) => {
      // Current run start
      if (s.startedAt) {
        const d = new Date(s.startedAt);
        if (!oldest || d < oldest) oldest = d;
      }
      // Historical runs
      (s.resetHistory || []).forEach((h) => {
        if (h.startedAt) {
          const d = new Date(h.startedAt);
          if (!oldest || d < oldest) oldest = d;
        }
      });
    });
    return oldest ? startOfMonth(oldest) : startOfMonth(new Date());
  }, [streaks]);

  const nowMonth = startOfMonth(new Date());

  // Clamp navigation
  const canGoPrev = isAfter(startOfMonth(currentMonth), oldestDate) || format(startOfMonth(currentMonth), 'yyyy-MM') !== format(oldestDate, 'yyyy-MM');
  const canGoNext = isBefore(startOfMonth(currentMonth), nowMonth);

  const goPrev = () => {
    const prev = subMonths(currentMonth, 1);
    if (!isBefore(startOfMonth(prev), oldestDate)) {
      setCurrentMonth(prev);
    }
  };

  const goNext = () => {
    const next = addMonths(currentMonth, 1);
    if (!isAfter(startOfMonth(next), nowMonth)) {
      setCurrentMonth(next);
    }
  };

  const source = useMemo(
    () => selectedStreak === 'all' ? streaks : streaks.filter((s) => s.id === selectedStreak),
    [streaks, selectedStreak]
  );

  const dateStreakMap = useMemo(() => {
    const map = {};
    const today = startOfDay(new Date()).getTime();
    const oldestMs = oldestDate.getTime();
    // Cover from oldest streak date to today
    const totalDays = Math.ceil((today - oldestMs) / 86400000) + 1;
    for (let i = 0; i < totalDays; i++) {
      const dayMs = today - i * 86400000;
      const dateStr = format(new Date(dayMs), 'yyyy-MM-dd');
      const running = source.filter((s) => wasRunningOnDay(s, dayMs));
      if (running.length > 0) {
        map[dateStr] = running.map((s) => ({ title: s.title, color: s.color, icon: s.icon }));
      }
    }
    return map;
  }, [source, oldestDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const dateCounts = useMemo(() => {
    const counts = {};
    Object.entries(dateStreakMap).forEach(([d, arr]) => { counts[d] = arr.length; });
    return counts;
  }, [dateStreakMap]);

  const maxCount = Math.max(1, ...Object.values(dateCounts));
  const getIntensity = (dateStr) => {
    const count = dateCounts[dateStr] || 0;
    if (count === 0) return 0;
    return Math.ceil((count / maxCount) * 4);
  };

  const handleDayTap = (dateStr, dayStreaks) => {
    if (dayStreaks.length > 0) {
      setPopupDay({ dateStr, streaks: dayStreaks });
    }
  };

  const popupDayData = popupDay ? dateStreakMap[popupDay.dateStr] || [] : [];

  return (
    <div className={styles.page}>
      <motion.h1 className={styles.heading} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Calendar
      </motion.h1>

      <div className={styles.filterRow}>
        <select
          value={selectedStreak}
          onChange={(e) => setSelectedStreak(e.target.value)}
          className={styles.select}
          aria-label="Filter by streak"
        >
          <option value="all">All Streaks (colored)</option>
          {streaks.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {/* Streak legend */}
      <div className={styles.streakLegend}>
        {streaks.map((s) => (
          <span key={s.id} className={styles.legendChip}>
            <span className={styles.legendDotColor} style={{ background: s.color }} />
            {s.title}
          </span>
        ))}
      </div>

      {/* Month navigation — clamped to streak date range */}
      <div className={styles.monthNav}>
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
          style={!canGoPrev ? { opacity: 0.3, pointerEvents: 'none' } : {}}
        >
          <FaChevronLeft />
        </button>
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Next month"
          style={!canGoNext ? { opacity: 0.3, pointerEvents: 'none' } : {}}
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Calendar grid with streak bars under each week */}
      <div className={styles.calendarWrap}>
        <div className={styles.calendar}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className={styles.dayHeader}>{d}</div>
          ))}
        </div>

        {/* Render weeks with bars */}
        {(() => {
          // Build cells: prev month padding + current month + next month padding
          const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
          const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));

          // Previous month trailing days (fill the gap before day 1)
          const prevPadding = [];
          for (let i = startDay - 1; i >= 0; i--) {
            const d = subDays(monthStart, i + 1);
            prevPadding.push({ key: `prev-${format(d, 'yyyy-MM-dd')}`, day: d, adjacent: true });
          }

          // Current month days
          const currentDays = days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            return {
              key: dateStr,
              day,
              dateStr,
              dayStreaks: dateStreakMap[dateStr] || [],
              isToday: isSameDay(day, new Date()),
              adjacent: false,
            };
          });

          const allCells = [...prevPadding, ...currentDays];

          // Next month leading days (fill to complete the last week)
          let nextDayCounter = 0;
          while (allCells.length % 7 !== 0) {
            const d = addDays(nextMonthStart, nextDayCounter);
            allCells.push({ key: `next-${format(d, 'yyyy-MM-dd')}`, day: d, adjacent: true });
            nextDayCounter++;
          }

          // Split into weeks
          const weeks = [];
          for (let i = 0; i < allCells.length; i += 7) {
            weeks.push(allCells.slice(i, i + 7));
          }

          // Collect unique streaks active in each week
          return weeks.map((week, wi) => {
            const weekStreaks = [];
            const seen = new Set();
            week.forEach((cell) => {
              if (!cell.adjacent && cell.dayStreaks) {
                cell.dayStreaks.forEach((s) => {
                  if (!seen.has(s.title)) {
                    seen.add(s.title);
                    weekStreaks.push(s);
                  }
                });
              }
            });

            return (
              <div key={wi}>
                <div className={styles.calendar}>
                  {week.map((cell) =>
                    cell.adjacent ? (
                      <div key={cell.key} className={styles.adjacentCell}>
                        <span className={styles.adjacentNumber}>{format(cell.day, 'd')}</span>
                      </div>
                    ) : (
                      <button
                        key={cell.key}
                        className={`${styles.dayCell} ${cell.isToday ? styles.today : ''} ${cell.dayStreaks.length > 0 ? styles.hasStreaks : ''}`}
                        onClick={() => handleDayTap(cell.dateStr, cell.dayStreaks)}
                        aria-label={`${format(cell.day, 'MMM d')}: ${cell.dayStreaks.length} streaks`}
                      >
                        <span className={styles.dayNumber}>{format(cell.day, 'd')}</span>
                      </button>
                    )
                  )}
                </div>
                {/* Colored streak bars under this week */}
                {weekStreaks.length > 0 && (
                  <div className={styles.weekBars}>
                    {weekStreaks.map((s, i) => (
                      <div key={i} className={styles.weekBar} style={{ background: s.color }} />
                    ))}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>

      {/* Day detail popup (replaces tooltip) */}
      <AnimatePresence>
        {popupDay && (
          <motion.div
            className={styles.popupOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPopupDay(null)}
          >
            <motion.div
              className={styles.popup}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.popupHeader}>
                <h3>{format(new Date(popupDay.dateStr + 'T00:00:00'), 'EEEE, MMM d, yyyy')}</h3>
                <button className={styles.popupClose} onClick={() => setPopupDay(null)} aria-label="Close">
                  <FaTimes />
                </button>
              </div>
              <div className={styles.popupBody}>
                {popupDay.streaks.length === 0 ? (
                  <p className={styles.popupEmpty}>No activity this day</p>
                ) : (
                  popupDay.streaks.map((s, i) => {
                    const Ic = ICONS.find((ic) => ic.name === s.icon)?.component;
                    return (
                      <div key={i} className={styles.popupItem}>
                        <span className={styles.popupDot} style={{ background: s.color }} />
                        {Ic && <Ic style={{ color: s.color, fontSize: 14 }} />}
                        <span className={styles.popupTitle}>{s.title}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak summary — replaces old heatmap legend */}
      <div className={styles.summaryCard}>
        <h3 className={styles.summaryTitle}>Streak Summary</h3>
        {streaks.length === 0 ? (
          <p className={styles.summaryEmpty}>No streaks created yet</p>
        ) : (
          <div className={styles.summaryList}>
            {streaks.map((s) => {
              const isActive = s.status === 'running';
              const days = isActive && s.startedAt
                ? Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 86400000)
                : 0;
              const hours = isActive && s.startedAt
                ? Math.floor(((Date.now() - new Date(s.startedAt).getTime()) % 86400000) / 3600000)
                : 0;
              const Ic = ICONS.find((ic) => ic.name === s.icon)?.component;
              return (
                <div key={s.id} className={styles.summaryRow}>
                  <span className={styles.summaryDot} style={{ background: s.color }} />
                  {Ic && <Ic style={{ color: s.color, fontSize: 13 }} />}
                  <span className={styles.summaryName}>{s.title}</span>
                  <span className={styles.summaryStatus} style={isActive ? { color: s.color } : {}}>
                    {isActive ? `${days}d ${hours}h` : 'Idle'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Year overview — only months from oldest streak to now */}
      <div className={styles.heatmapSection}>
        <h2>Year Overview</h2>
        <YearBars streaks={source} dateStreakMap={dateStreakMap} oldestDate={oldestDate} />
      </div>
    </div>
  );
}

/**
 * Year overview — shows months from oldestDate to current month.
 */
function YearBars({ streaks: sourceStreaks, dateStreakMap, oldestDate }) {
  const months = [];
  const today = new Date();
  const nowMonth = startOfMonth(today);
  let cursor = startOfMonth(oldestDate);

  // Walk from oldest month to current month
  while (!isAfter(cursor, nowMonth)) {
    const d = new Date(cursor);
    const label = format(d, 'MMM yyyy');
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    const activeStreaks = sourceStreaks.filter((s) => {
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = format(new Date(d.getFullYear(), d.getMonth(), day), 'yyyy-MM-dd');
        if (dateStreakMap[dateStr]?.some((ds) => ds.title === s.title)) return true;
      }
      return false;
    });

    months.push({ label, activeStreaks });
    cursor = addMonths(cursor, 1);
  }

  return (
    <div className={styles.yearBars}>
      {months.map((m) => (
        <div key={m.label} className={styles.yearMonth}>
          <span className={styles.yearMonthLabel}>{m.label}</span>
          <div className={styles.yearBarRow}>
            {m.activeStreaks.length > 0 ? (
              m.activeStreaks.map((s, i) => (
                <div key={i} className={styles.yearBar} style={{ background: s.color }} title={s.title} />
              ))
            ) : (
              <div className={styles.yearBarEmpty} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
