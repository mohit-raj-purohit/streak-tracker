import { format, differenceInSeconds, parseISO, startOfDay, subDays, differenceInCalendarDays } from 'date-fns';

/**
 * Generate a unique ID
 */
export const generateId = () =>
  crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);

/**
 * Format a date string for display
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return format(parseISO(dateStr), 'MMM d, yyyy');
};

/**
 * Format a full datetime for display
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
};

/**
 * Get today's date as ISO string (date only)
 */
export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

/**
 * Calculate elapsed milliseconds since a given ISO datetime
 */
export const elapsedMs = (startedAt) => {
  if (!startedAt) return 0;
  return Math.max(0, Date.now() - new Date(startedAt).getTime());
};

/**
 * Calculate elapsed days (floored) from milliseconds
 */
export const msToDays = (ms) => Math.floor(ms / 86400000);

/**
 * Format a duration in ms to a short human string like "12d 5h"
 */
export const formatDurationShort = (ms) => {
  if (ms <= 0) return '0d';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${mins}m`;
};

/**
 * Get the longest run duration from reset history + current run
 */
export const getLongestRun = (streak) => {
  let longest = 0;
  (streak.resetHistory || []).forEach((r) => {
    if (r.durationMs > longest) longest = r.durationMs;
  });
  if (streak.status === 'running' && streak.startedAt) {
    const current = elapsedMs(streak.startedAt);
    if (current > longest) longest = current;
  }
  return longest;
};

/**
 * Get weekly consistency data for the last N weeks.
 * For the new model we check if the streak was running on each day.
 */
export const getWeeklyConsistency = (streaks, weeks = 8) => {
  const today = startOfDay(new Date());
  const data = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = subDays(today, w * 7 + 6);
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const day = subDays(today, w * 7 + (6 - d));
      const dayMs = day.getTime();
      // Count how many streaks were running on this day
      const running = streaks.filter((s) => {
        if (!s.startedAt) return false;
        const start = new Date(s.startedAt).getTime();
        return start <= dayMs + 86400000; // started before end of day
      });
      if (running.length > 0) count++;
    }
    data.push({
      week: format(weekStart, 'MMM d'),
      days: count,
      percentage: Math.round((count / 7) * 100),
    });
  }
  return data;
};

/**
 * Get monthly consistency data for the last N months
 */
export const getMonthlyConsistency = (streaks, months = 6) => {
  const today = new Date();
  const data = [];

  for (let m = months - 1; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    let count = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
      const dayMs = day.getTime();
      const running = streaks.filter((s) => {
        if (!s.startedAt) return false;
        return new Date(s.startedAt).getTime() <= dayMs + 86400000;
      });
      if (running.length > 0) count++;
    }

    data.push({
      month: format(monthDate, 'MMM'),
      days: count,
      total: daysInMonth,
      percentage: Math.round((count / daysInMonth) * 100),
    });
  }
  return data;
};

/**
 * Export streaks data as JSON file download
 */
export const exportData = (streaks) => {
  const data = JSON.stringify({ streaks, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `streak-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Import streaks data from a JSON file
 */
export const importData = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (parsed.streaks && Array.isArray(parsed.streaks)) {
            resolve(parsed.streaks);
          } else {
            reject(new Error('Invalid data format'));
          }
        } catch {
          reject(new Error('Failed to parse JSON'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
};
