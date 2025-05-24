import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaHome, FaProjectDiagram, FaUsers, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: <FaHome /> },
    { title: 'Projects', path: '/admin/projects', icon: <FaProjectDiagram /> },
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

const Header = ({ toggleSidebar }) => {
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
        <div className="relative">
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=fe3201&color=fff"
            alt="User"
            className="h-8 w-8 rounded-full"
          />
        </div>
      </div>
    </header>
  );
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 flex-col md:pl-64">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="mt-16 flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
