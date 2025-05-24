import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCalendar, FiInfo, FiClock, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const UserProjectsPage = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Demandé', label: 'Demandé' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Terminé', label: 'Terminé' },
    { value: 'Annulé', label: 'Annulé' },
  ];

  // Fetch user projects on component mount
  useEffect(() => {
    if (currentUser) {
      fetchUserProjects();
    }
  }, [currentUser]);

  // Filter projects when search query or status filter changes
  useEffect(() => {
    filterProjects();
  }, [searchQuery, statusFilter, projects]);

  const fetchUserProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/user/${currentUser._id}`);
      
      // Handle different API response formats
      if (response.data && Array.isArray(response.data)) {
        setProjects(response.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.projects)) {
        setProjects(response.data.projects);
      } else {
        setError('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error fetching user projects:', err);
      setError('Failed to load your projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) || 
        (project.description && project.description.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coquelicot"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUserProjects}
            className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Please log in to view your projects.</p>
          <Link to="/login" className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors">
            Log In
          </Link>
        </div>
      );
    }

    if (filteredProjects.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-2">No projects found matching your criteria.</p>
          {projects.length > 0 ? (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="text-coquelicot hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-gray-600 mb-4">You don't have any projects yet.</p>
              <Link 
                to="/contact"
                className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
              >
                Request a Project
              </Link>
            </div>
          )}
        </div>
      );
    }

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredProjects.map((project) => (
          <motion.div
            key={project._id}
            variants={itemVariants}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="relative h-48 overflow-hidden">
              {project.pictures && project.pictures.length > 0 ? (
                <img
                  src={project.pictures[0]}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Terminé' ? 'bg-green-100 text-green-800' :
                  project.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'Demandé' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'No description available'}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FiCalendar className="mr-2 h-4 w-4" />
                  <span>Created: {formatDate(project.createdAt)}</span>
                </div>
                {project.location && project.location.type === 'Point' && (
                  <div className="flex items-center text-sm text-gray-500">
                    <FiMapPin className="mr-2 h-4 w-4" />
                    <span>Location specified</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <FiClock className="mr-2 h-4 w-4" />
                  <span>Last update: {formatDate(project.updatedAt || project.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link 
                  to={`/projects/${project._id}`}
                  className="inline-flex items-center px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
                >
                  <FiInfo className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Projects</h1>
          <p className="text-gray-600">
            View and manage all your electrical projects with HEC Tunisia.
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex-grow">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coquelicot-500"
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coquelicot-500 appearance-none bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="mt-8">
          {renderContent()}
        </div>

        {/* Request New Project Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link 
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-coquelicot text-white rounded-md shadow-md hover:bg-coquelicot-600 transition-colors"
          >
            Request a New Project
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProjectsPage;
