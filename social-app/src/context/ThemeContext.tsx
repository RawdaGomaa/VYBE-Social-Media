import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ThemeContextValue = { theme: Theme; toggleTheme: () => void; setTheme: (theme: Theme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
function readTheme(): Theme {
  try { return localStorage.getItem('vybe-theme') === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('vybe-theme', theme); } catch { /* Storage can be unavailable. */ }
  }, [theme]);
  const value = useMemo(() => ({theme, setTheme, toggleTheme: () => setTheme(current => current === 'light' ? 'dark' : 'light')}), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
