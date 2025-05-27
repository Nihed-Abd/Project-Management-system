import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiFolder, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import ChatBot from '../components/ChatBot';

const ClientLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const profileRef = useRef(null);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`flex min-h-screen flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Navigation */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? isDark ? 'bg-gray-900 shadow-md' : 'bg-white shadow-md' 
            : isDark ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="HEC Logo" 
                className="h-12 w-24" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/40x40?text=HEC';
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-8">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`text-base font-medium transition-colors duration-200 hover:text-coquelicot ${
                        location.pathname === item.path
                          ? 'text-coquelicot'
                          : isDark ? 'text-gray-300' : 'text-silver-100'
                      }`}
                    >
                      {item.name}
                      {location.pathname === item.path && (
                        <motion.div
                          layoutId="navigation-underline"
                          className="mt-1 h-0.5 bg-coquelicot"
                          initial={{ x: '100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '100%' }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth Buttons or User Profile */}
            <div className="hidden items-center space-x-4 md:flex">
              <ThemeToggle />
              {currentUser ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100"
                  >
                    <img 
                      src={currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=fe3201&color=fff`} 
                      alt={currentUser.name} 
                      className="h-8 w-8 rounded-full"
                    />
                    <span className={`ml-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {currentUser.name || currentUser.email.split('@')[0]}
                    </span>
                  </button>
                  
                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5"
                      >
                        <Link to="/profile" className={`flex items-center px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                          <FiUser className="mr-3 h-4 w-4" /> Profile
                        </Link>
                        <Link to="/user-projects" className={`flex items-center px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                          <FiFolder className="mr-3 h-4 w-4" /> My Projects
                        </Link>
                        <Link to="/interviews" className={`flex items-center px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                          <FiCalendar className="mr-3 h-4 w-4" /> My Interviews
                        </Link>
                        <Link to="/reclamations" className={`flex items-center px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                          <FiMessageSquare className="mr-3 h-4 w-4" /> My Reclamations
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className={`flex w-full items-center px-4 py-2 text-sm text-left ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          <FiLogOut className="mr-3 h-4 w-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-md px-4 py-2 text-sm font-medium text-coquelicot transition-colors hover:bg-coquelicot-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-md bg-coquelicot px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coquelicot-600"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center">
              <ThemeToggle className="mr-2 hidden sm:flex md:hidden" />
              <button
                className="flex items-center md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu className={`h-6 w-6 ${isDark ? 'text-gray-300' : 'text-silver-100'}`} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-timberwolf-400 md:hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={`block py-2 text-base font-medium ${
                          location.pathname === item.path
                            ? 'text-coquelicot'
                            : isDark ? 'text-gray-300' : 'text-silver-100'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-6 flex flex-col space-y-2">
                    {currentUser ? (
                      <>
                        <div className="flex justify-center my-2">
                          <ThemeToggle className="mx-auto" />
                        </div>
                        <Link to="/profile" className="flex items-center rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100">
                          <FiUser className="mr-3 h-4 w-4" /> Profile
                        </Link>
                        <Link to="/user-projects" className="flex items-center rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100">
                          <FiFolder className="mr-3 h-4 w-4" /> My Projects
                        </Link>
                        <Link to="/interviews" className="flex items-center rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100">
                          <FiCalendar className="mr-3 h-4 w-4" /> My Interviews
                        </Link>
                        <Link to="/reclamations" className="flex items-center rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100">
                          <FiMessageSquare className="mr-3 h-4 w-4" /> My Reclamations
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex w-full items-center rounded-md px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                        >
                          <FiLogOut className="mr-3 h-4 w-4" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center my-2">
                          <ThemeToggle className="mx-auto" />
                        </div>
                        <Link
                          to="/login"
                          className={`block py-2 px-4 ${location.pathname === '/login' ? 'text-coquelicot font-medium' : isDark ? 'text-gray-300 hover:text-coquelicot' : 'text-silver-100 hover:text-coquelicot'}`}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="rounded-md bg-coquelicot px-4 py-2 text-center text-white transition-colors hover:bg-coquelicot-600 w-full mb-2"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content with padding for the fixed header */}
      <main className="flex-1 pt-20" data-theme={theme}>
        <Outlet />
      </main>

      {/* Footer */}
      {/* ChatBot Component */}
      <ChatBot />
      
      <footer className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} py-8 border-t`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>HEC</h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Hammemi Electricity Concept provides quality electrical services and solutions for all your needs.
              </p>
            </div>
            <div>
              <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-coquelicot`}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Contact</h3>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>Email: contact@hec.com</li>
                <li>Phone: +123 456 7890</li>
                <li>Address: 123 Main St, City</li>
              </ul>
            </div>
            <div>
              <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-coquelicot">
                  Facebook
                </a>
                <a href="#" className="text-gray-600 hover:text-coquelicot">
                  Twitter
                </a>
                <a href="#" className="text-gray-600 hover:text-coquelicot">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className={`mt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <p>&copy; {new Date().getFullYear()} Hammemi Electricity Concept. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
