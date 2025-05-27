import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiCheck } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Available languages
  const languages = [
    { code: 'en', name: t('languages.english'), flag: '🇺🇸' },
    { code: 'fr', name: t('languages.french'), flag: '🇫🇷' }
  ];

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle language change
  const handleLanguageChange = (lng) => {
    changeLanguage(lng);
    setIsOpen(false);
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { 
        duration: 0.2 
      }
    }
  };

  // Get current language object
  const currentLanguage = languages.find(lng => lng.code === language);

  return (
    <div className="relative" ref={menuRef}>
      {/* Language Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
            : 'bg-white hover:bg-gray-100 text-gray-800'
        } border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}
        aria-label={t('languages.changeLanguage')}
      >
        <FiGlobe className="text-lg" />
        <span className="text-sm font-medium">{currentLanguage?.flag}</span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } z-50`}
          >
            <div className="py-1 rounded-md overflow-hidden">
              <div className={`px-4 py-2 text-sm font-medium border-b ${
                isDark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>
                {t('languages.changeLanguage')}
              </div>
              {languages.map((lng) => (
                <motion.button
                  key={lng.code}
                  whileHover={{ backgroundColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 1)' }}
                  onClick={() => handleLanguageChange(lng.code)}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  } flex items-center justify-between`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{lng.flag}</span>
                    {lng.name}
                  </div>
                  {language === lng.code && <FiCheck className="text-coquelicot" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
