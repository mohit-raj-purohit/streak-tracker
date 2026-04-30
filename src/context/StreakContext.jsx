import { createContext, useContext, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEY } from '../utils/constants';
import { generateId, elapsedMs, msToDays, getLongestRun } from '../utils/helpers';

const StreakContext = createContext();

export function StreakProvider({ children }) {
  const [streaks, setStreaks] = useLocalStorage(STORAGE_KEY, []);

  /** Add a new streak (created in idle state) */
  const addStreak = useCallback((data) => {
    const newStreak = {
      id: generateId(),
      title: data.title,
      status: 'idle',
      startedAt: null,
      category: data.category || 'personal',
      notes: data.notes || '',
      color: data.color || '#3b82f6',
      icon: data.icon || 'FaFire',
      order: Date.now(),
      resetHistory: [],
      goal: data.goal || null,        // e.g. { days: 30 }
      reminderTime: data.reminderTime || null, // e.g. "09:00"
    };
    setStreaks((prev) => [...prev, newStreak]);
    return newStreak;
  }, [setStreaks]);

  /** Edit an existing streak's metadata */
  const editStreak = useCallback((id, updates) => {
    setStreaks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, [setStreaks]);

  /** Delete a streak */
  const deleteStreak = useCallback((id) => {
    setStreaks((prev) => prev.filter((s) => s.id !== id));
  }, [setStreaks]);

  /** Delete all streaks */
  const deleteAllStreaks = useCallback(() => {
    setStreaks([]);
  }, [setStreaks]);

  /** Start a streak — sets status to running and records startedAt */
  const startStreak = useCallback((id) => {
    setStreaks((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.status === 'running') return s; // already running
        return {
          ...s,
          status: 'running',
          startedAt: new Date().toISOString(),
        };
      })
    );
  }, [setStreaks]);

  /** Reset a streak — records the run in history, then restarts idle */
  const resetStreak = useCallback((id) => {
    setStreaks((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const duration = s.startedAt ? elapsedMs(s.startedAt) : 0;
        const historyEntry = {
          startedAt: s.startedAt,
          resetAt: new Date().toISOString(),
          durationMs: duration,
        };
        return {
          ...s,
          status: 'idle',
          startedAt: null,
          resetHistory: [...(s.resetHistory || []), historyEntry],
        };
      })
    );
  }, [setStreaks]);

  /** Reset a streak at a specific date/time (must be after startedAt) */
  const resetStreakAt = useCallback((id, resetDateISO) => {
    setStreaks((prev) =>
      prev.map((s) => {
        if (s.id !== id || !s.startedAt) return s;
        const startMs = new Date(s.startedAt).getTime();
        const resetMs = new Date(resetDateISO).getTime();
        if (resetMs <= startMs) return s; // must be after start
        const duration = resetMs - startMs;
        const historyEntry = {
          startedAt: s.startedAt,
          resetAt: resetDateISO,
          durationMs: duration,
        };
        return {
          ...s,
          status: 'idle',
          startedAt: null,
          resetHistory: [...(s.resetHistory || []), historyEntry],
        };
      })
    );
  }, [setStreaks]);

  /** Update the start date/time of a running streak */
  const updateStartDate = useCallback((id, newStartISO) => {
    setStreaks((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.status !== 'running') return s;
        return { ...s, startedAt: newStartISO };
      })
    );
  }, [setStreaks]);

  /** Reorder streaks (drag & drop) */
  const reorderStreaks = useCallback((startIndex, endIndex) => {
    setStreaks((prev) => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((s, i) => ({ ...s, order: i }));
    });
  }, [setStreaks]);

  /** Import streaks (merge or replace) */
  const importStreaks = useCallback((imported, replace = false) => {
    if (replace) {
      setStreaks(imported);
    } else {
      setStreaks((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newOnes = imported.filter((s) => !existingIds.has(s.id));
        return [...prev, ...newOnes];
      });
    }
  }, [setStreaks]);

  // Derived stats
  const stats = useMemo(() => {
    const running = streaks.filter((s) => s.status === 'running');
    const longestMs = streaks.reduce((max, s) => Math.max(max, getLongestRun(s)), 0);
    const longestDays = msToDays(longestMs);
    const totalResets = streaks.reduce((sum, s) => sum + (s.resetHistory?.length || 0), 0);

    return {
      totalStreaks: streaks.length,
      runningStreaks: running.length,
      idleStreaks: streaks.length - running.length,
      longestStreakDays: longestDays,
      totalResets,
    };
  }, [streaks]);

  const value = useMemo(() => ({
    streaks,
    stats,
    addStreak,
    editStreak,
    deleteStreak,
    deleteAllStreaks,
    startStreak,
    resetStreak,
    resetStreakAt,
    updateStartDate,
    reorderStreaks,
    importStreaks,
    setStreaks,
  }), [streaks, stats, addStreak, editStreak, deleteStreak, deleteAllStreaks, startStreak, resetStreak, resetStreakAt, updateStartDate, reorderStreaks, importStreaks, setStreaks]);

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
}

export const useStreaks = () => {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreaks must be used within StreakProvider');
  return ctx;
};
