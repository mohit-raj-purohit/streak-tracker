import {
  FaHeartbeat, FaBriefcase, FaUser, FaStar, FaBook, FaDumbbell,
  FaCode, FaMusic, FaPaintBrush, FaRunning, FaAppleAlt, FaCoffee,
  FaMoon, FaSmile, FaLeaf, FaFire, FaBolt, FaTrophy, FaGem, FaRocket
} from 'react-icons/fa';

export const CATEGORIES = [
  { value: 'health', label: 'Health', color: '#34d399' },
  { value: 'work', label: 'Work', color: '#60a5fa' },
  { value: 'personal', label: 'Personal', color: '#f472b6' },
  { value: 'custom', label: 'Custom', color: '#a78bfa' },
];

export const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#f43f5e', '#64748b',
];

export const ICONS = [
  { name: 'FaFire', component: FaFire },
  { name: 'FaDumbbell', component: FaDumbbell },
  { name: 'FaCode', component: FaCode },
  { name: 'FaBook', component: FaBook },
  { name: 'FaRunning', component: FaRunning },
  { name: 'FaAppleAlt', component: FaAppleAlt },
  { name: 'FaHeartbeat', component: FaHeartbeat },
  { name: 'FaBriefcase', component: FaBriefcase },
  { name: 'FaUser', component: FaUser },
  { name: 'FaStar', component: FaStar },
  { name: 'FaMusic', component: FaMusic },
  { name: 'FaPaintBrush', component: FaPaintBrush },
  { name: 'FaCoffee', component: FaCoffee },
  { name: 'FaMoon', component: FaMoon },
  { name: 'FaSmile', component: FaSmile },
  { name: 'FaLeaf', component: FaLeaf },
  { name: 'FaBolt', component: FaBolt },
  { name: 'FaTrophy', component: FaTrophy },
  { name: 'FaGem', component: FaGem },
  { name: 'FaRocket', component: FaRocket },
];

export const ACHIEVEMENTS = [
  { id: 'week_warrior', title: 'Week Warrior', description: '7-day streak', days: 7, emoji: '🔥' },
  { id: 'month_master', title: 'Month Master', description: '30-day streak', days: 30, emoji: '⭐' },
  { id: 'century_club', title: 'Century Club', description: '100-day streak', days: 100, emoji: '💎' },
  { id: 'first_streak', title: 'First Step', description: 'Created first streak', days: 0, emoji: '🎯' },
  { id: 'five_active', title: 'Multi-Tasker', description: '5 active streaks', days: 0, emoji: '🚀' },
  { id: 'perfect_week', title: 'Perfect Week', description: 'All streaks checked for 7 days', days: 0, emoji: '🏆' },
];

export const MOTIVATIONAL_QUOTES = [
  "Consistency is the key to mastery.",
  "Small daily improvements lead to stunning results.",
  "Don't break the chain!",
  "The secret of getting ahead is getting started.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You don't have to be extreme, just consistent.",
  "It's not about perfect. It's about effort.",
  "A year from now you'll wish you had started today.",
  "Discipline is choosing between what you want now and what you want most.",
  "The only bad workout is the one that didn't happen.",
  "Progress, not perfection.",
  "Every day is a fresh start.",
];

export const STORAGE_KEY = 'streak-tracker-data';
export const THEME_KEY = 'streak-tracker-theme';
export const REMINDERS_KEY = 'streak-tracker-reminders';
