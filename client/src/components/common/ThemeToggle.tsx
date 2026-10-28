import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 rounded-full p-2 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 group border border-border bg-card/80 hover:bg-card shadow-sm hover:border-primary/40 hover:shadow-glow active:scale-95 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`h-4 w-4 text-amber-500 transition-all duration-500 transform ${
            isDark
              ? '-rotate-90 scale-0 opacity-0 absolute'
              : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`h-4 w-4 text-emerald-400 transition-all duration-500 transform ${
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0 absolute'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold text-foreground pr-1">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
