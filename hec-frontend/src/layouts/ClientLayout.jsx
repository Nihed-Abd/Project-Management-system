import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const ClientLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'About Us', path: '/about' },
    { name: 'Help Center', path: '/help' },
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
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-isabelline-800">
      {/* Navigation */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? 'bg-timberwolf-400 shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="HEC Logo" 
                className="h-10 w-10" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/40x40?text=HEC';
                }}
              />
              <span className="ml-2 text-xl font-bold text-coquelicot">HEC</span>
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
                          : 'text-silver-100'
                      }`}
                    >
                      {item.name}
                      {location.pathname === item.path && (
                        <motion.div
                          layoutId="navigation-underline"
                          className="mt-1 h-0.5 bg-coquelicot"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden items-center space-x-4 md:flex">
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-coquelicot transition-colors hover:bg-coquelicot hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-coquelicot px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coquelicot-600"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="rounded-md p-2 text-silver-100 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
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
                            : 'text-silver-100'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-6 flex flex-col space-y-2">
                    <Link
                      to="/login"
                      className="rounded-md px-4 py-2 text-center text-coquelicot transition-colors hover:bg-coquelicot-100"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-md bg-coquelicot px-4 py-2 text-center text-white transition-colors hover:bg-coquelicot-600"
                    >
                      Sign Up
                    </Link>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content with padding for the fixed header */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-timberwolf-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold text-silver-100">HEC</h3>
              <p className="text-sm text-silver-200">
                Hammemi Electricity Concept provides quality electrical services and solutions for all your needs.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-silver-100">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-silver-200 hover:text-coquelicot">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-silver-100">Contact</h3>
              <ul className="space-y-2 text-sm text-silver-200">
                <li>Email: contact@hec.com</li>
                <li>Phone: +123 456 7890</li>
                <li>Address: 123 Main St, City</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-silver-100">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-silver-200 hover:text-coquelicot">
                  Facebook
                </a>
                <a href="#" className="text-silver-200 hover:text-coquelicot">
                  Twitter
                </a>
                <a href="#" className="text-silver-200 hover:text-coquelicot">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-silver-300 pt-6 text-center text-sm text-silver-200">
            <p>&copy; {new Date().getFullYear()} Hammemi Electricity Concept. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
