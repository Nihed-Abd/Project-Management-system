import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex h-8 w-16 items-center justify-between rounded-full p-1 transition-colors duration-300 ${
        isDark ? 'bg-slate-700' : 'bg-orange-100'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <FiSun className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-coquelicot'}`} />
      <FiMoon className={`h-5 w-5 ${isDark ? 'text-coquelicot' : 'text-gray-400'}`} />
      
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`absolute h-6 w-6 rounded-full ${
          isDark ? 'bg-slate-800' : 'bg-white'
        } shadow-md`}
        style={{
          left: isDark ? 'calc(100% - 28px)' : '4px'
        }}
      />
    </button>
  );
};

export default ThemeToggle;
