import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { useStreaks } from '../context/StreakContext';
import { useTheme } from '../context/ThemeContext';
import { getWeeklyConsistency, getMonthlyConsistency, elapsedMs, msToDays } from '../utils/helpers';
import { CATEGORIES } from '../utils/constants';
import styles from './StatsPage.module.css';

export default function StatsPage() {
  const { streaks, stats } = useStreaks();
  const { theme } = useTheme();
  const [chartView, setChartView] = useState('weekly');

  const textColor = theme === 'dark' ? '#98989d' : '#6e6e73';
  const gridColor = theme === 'dark' ? '#2c2c2e' : '#e5e5ea';

  const weeklyData = useMemo(() => getWeeklyConsistency(streaks, 8), [streaks]);
  const monthlyData = useMemo(() => getMonthlyConsistency(streaks, 6), [streaks]);

  // Category distribution
  const categoryData = useMemo(() => {
    const counts = {};
    streaks.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return CATEGORIES.filter((c) => counts[c.value]).map((c) => ({
      name: c.label,
      value: counts[c.value],
      color: c.color,
    }));
  }, [streaks]);

  // Top streaks by current run days
  const topStreaks = useMemo(
    () => [...streaks]
      .filter((s) => s.status === 'running')
      .map((s) => ({ ...s, runDays: msToDays(elapsedMs(s.startedAt)) }))
      .sort((a, b) => b.runDays - a.runDays)
      .slice(0, 5),
    [streaks]
  );

  const chartData = chartView === 'weekly' ? weeklyData : monthlyData;

  return (
    <div className={styles.page}>
      <motion.h1 className={styles.heading} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Statistics
      </motion.h1>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryValue}>{stats.totalStreaks}</p>
          <p className={styles.summaryLabel}>Total Streaks</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryValue}>{stats.runningStreaks}</p>
          <p className={styles.summaryLabel}>Running</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryValue}>{stats.longestStreakDays}d</p>
          <p className={styles.summaryLabel}>Longest Run</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryValue}>{stats.totalResets}</p>
          <p className={styles.summaryLabel}>Total Resets</p>
        </div>
      </div>

      {/* Consistency chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>Consistency</h2>
          <div className={styles.chartToggle}>
            <button className={chartView === 'weekly' ? styles.active : ''} onClick={() => setChartView('weekly')}>
              Weekly
            </button>
            <button className={chartView === 'monthly' ? styles.active : ''} onClick={() => setChartView('monthly')}>
              Monthly
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0a84ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={chartView === 'weekly' ? 'week' : 'month'}
              tick={{ fill: textColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: theme === 'dark' ? '#1c1c1e' : '#fff',
                border: `1px solid ${gridColor}`,
                borderRadius: 10,
                fontSize: 13,
              }}
            />
            <Area type="monotone" dataKey="days" stroke="#0a84ff" strokeWidth={2} fill="url(#colorDays)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.row}>
        {/* Category distribution */}
        <div className={styles.chartCard}>
          <h2>Categories</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#1c1c1e' : '#fff',
                    border: `1px solid ${gridColor}`,
                    borderRadius: 10,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.noData}>No data yet</p>
          )}
          <div className={styles.legend}>
            {categoryData.map((c) => (
              <span key={c.name} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: c.color }} />
                {c.name} ({c.value})
              </span>
            ))}
          </div>
        </div>

        {/* Top running streaks */}
        <div className={styles.chartCard}>
          <h2>Top Running Streaks</h2>
          {topStreaks.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topStreaks} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fill: textColor, fontSize: 12 }}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#1c1c1e' : '#fff',
                    border: `1px solid ${gridColor}`,
                    borderRadius: 10,
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="runDays" name="Days" radius={[0, 6, 6, 0]}>
                  {topStreaks.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.noData}>No running streaks</p>
          )}
        </div>
      </div>
    </div>
  );
}
