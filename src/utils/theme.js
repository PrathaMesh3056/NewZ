// Centralized theme utilities
// Usage:
//   import { getTheme, setTheme, applyTheme, isDark } from '../utils/theme';
//   const theme = getTheme(); // 'light' | 'dark'
//   applyTheme(theme);
//   setTheme('dark');

const THEME_KEY = 'theme';

export function getTheme() {
  try {
    // Backward compatibility: migrate old boolean key 'theme-dark'
    const legacy = localStorage.getItem('theme-dark');
    if (legacy === 'true') return 'dark';
    if (legacy === 'false') return 'light';

    const t = localStorage.getItem(THEME_KEY);
    return t === 'dark' || t === 'light' ? t : 'light';
  } catch {
    return 'light';
  }
}

export function setTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  try {
    localStorage.setItem(THEME_KEY, t);
    localStorage.setItem('theme-dark', String(t === 'dark'));
  } catch {}
}

export function applyTheme(theme) {
  const isDark = theme === 'dark';
  const root = document.documentElement;
  const body = document.body;
  const meta = document.querySelector('meta[name="theme-color"]');
  root.classList.toggle('dark', isDark);
  if (body) body.classList.toggle('dark', isDark);
  if (meta) meta.setAttribute('content', isDark ? '#0b0f19' : '#ffffff');
  if (body) body.style.backgroundColor = isDark ? '#0b0f19' : '#f9fafb';
}

export function isDark() {
  return getTheme() === 'dark';
}
