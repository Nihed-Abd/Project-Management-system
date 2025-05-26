import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiChevronDown, FiMapPin } from 'react-icons/fi';
import { FaHome, FaProjectDiagram, FaUsers, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: <FaHome /> },
    { title: 'Projects', path: '/admin/projects', icon: <FaProjectDiagram /> },
    { title: 'Projects Location', path: '/admin/map', icon: <FiMapPin /> },
    { title: 'Meetings', path: '/admin/meetings', icon: <FaCalendarAlt /> },
    { title: 'Reclamations', path: '/admin/reclamations', icon: <FaExclamationTriangle /> },
    { title: 'Users', path: '/admin/users', icon: <FaUsers /> },
  ];

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-0 z-40 h-full w-64 bg-white text-gray-800 shadow-lg ${isOpen ? 'block' : 'hidden md:block'}`}
    >
      <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center">
          <img src="/logo.png" alt="HEC Logo" className="h-10 w-10" />
        </div>
        <button className="block md:hidden" onClick={toggleSidebar}>
          <FiX className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center rounded-lg px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-coquelicot-500 hover:text-white ${
                  location.pathname === item.path ? 'bg-coquelicot-500 text-white' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

const Header = ({ toggleSidebar, userData }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
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
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
    setIsProfileOpen(false);
  };
  
  return (
    <header className="fixed top-0 z-30 flex h-16 w-full items-center justify-between bg-white px-4 border-b border-gray-200">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        >
          <FiMenu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-coquelicot-500">HEC Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        {userData && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-coquelicot-500 focus:ring-offset-2"
            >
              <img
                src={userData.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'Admin User')}&background=fe3201&color=fff`}
                alt={userData.name || 'Admin User'}
                className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
              />
              <div className="hidden md:flex items-center">
                <span className="text-sm font-medium text-gray-700">{userData.name || userData.email?.split('@')[0] || 'Admin User'}</span>
                <FiChevronDown className={`ml-1 h-4 w-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-sm font-semibold text-gray-700">{userData.name || 'Admin User'}</p>
                    <p className="truncate text-xs text-gray-500">{userData.email || ''}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FiLogOut className="mr-2 h-4 w-4 text-gray-500" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  
  // Set user data from currentUser when it changes
  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
    } else {
      // If no currentUser, try to get from localStorage as fallback
      const role = localStorage.getItem('userRole');
      if (role) {
        setUserData({
          name: localStorage.getItem('userName') || 'Admin User',
          email: localStorage.getItem('userEmail') || 'admin@example.com',
          role: role
        });
      }
    }
  }, [currentUser]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-isabelline-600">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} userData={userData} />
      <div className="ml-0 pt-16 md:ml-64">
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
