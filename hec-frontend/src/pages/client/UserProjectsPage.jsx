import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCalendar, FiInfo, FiClock, FiMapPin, FiGrid, FiList, FiTrash2 } from 'react-icons/fi';
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
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  
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

  // Get available years from projects for year filter
  const [availableYears, setAvailableYears] = useState([]);
  
  useEffect(() => {
    if (projects.length > 0) {
      // Extract unique years from project creation dates
      const years = [...new Set(projects.map(project => {
        const date = new Date(project.creationDate || project.createdAt);
        return date.getFullYear();
      }))].sort((a, b) => b - a); // Sort descending
      
      setAvailableYears(years);
    }
  }, [projects]);
  
  // Filter projects when search query, status filter, or date filters change
  useEffect(() => {
    filterProjects();
  }, [searchQuery, statusFilter, yearFilter, monthFilter, projects]);

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
    
    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(project => {
        const date = new Date(project.creationDate || project.createdAt);
        return date.getFullYear() === parseInt(yearFilter);
      });
      
      // Apply month filter (only if year is selected)
      if (monthFilter) {
        filtered = filtered.filter(project => {
          const date = new Date(project.creationDate || project.createdAt);
          return date.getMonth() === parseInt(monthFilter) - 1; // JavaScript months are 0-11
        });
      }
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
  
  // Handle year filter change
  const handleYearFilterChange = (e) => {
    const year = e.target.value;
    setYearFilter(year);
    // Reset month filter when year changes
    if (year === '') {
      setMonthFilter('');
    }
  };
  
  // Handle month filter change
  const handleMonthFilterChange = (e) => {
    setMonthFilter(e.target.value);
  };
  
  // Toggle view mode between grid and list
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Handle project withdrawal (only for status 'Demandé')
  const handleWithdrawProject = (projectId) => {
    Swal.fire({
      title: 'Withdraw Project Request?',
      text: 'Are you sure you want to withdraw this project request? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, withdraw it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`);
          
          if (response.data && response.data.success) {
            Swal.fire({
              title: 'Withdrawn!',
              text: 'Your project request has been withdrawn.',
              icon: 'success',
              confirmButtonColor: '#EF4444'
            });
            // Refresh project list
            fetchUserProjects();
          } else {
            throw new Error('Failed to withdraw project request');
          }
        } catch (err) {
          console.error('Error withdrawing project:', err);
          Swal.fire({
            title: 'Error',
            text: err.response?.data?.message || 'Failed to withdraw project request. Please try again.',
            icon: 'error'
          });
        }
      }
    });
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

  // Helper to get status class colors
  const getStatusClass = (status) => {
    switch(status) {
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Demandé': return 'bg-amber-100 text-amber-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <p className="text-gray-600 mb-4">No projects found.</p>
          {(searchQuery || statusFilter || yearFilter || monthFilter) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setYearFilter('');
                setMonthFilter('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      );
    }

    // Project count display
    const projectCountDisplay = (
      <div className="mb-6 text-sm text-gray-500">
        Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
      </div>
    );

    // Render grid view
    if (viewMode === 'grid') {
      return (
        <>
          {projectCountDisplay}
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project) => (
              <motion.div
                key={project._id}
                variants={itemVariants}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all h-full flex flex-col"
                whileHover={{ y: -5 }}
              >
                <div className="relative h-48 overflow-hidden">
                  {project.pictures && project.pictures.length > 0 ? (
                    <img 
                      src={project.pictures[0]} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex-grow">
                    {project.description ? (
                      project.description.length > 120 
                        ? `${project.description.substring(0, 120)}...` 
                        : project.description
                    ) : 'No description available'}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 mt-auto mb-3">
                    <FiCalendar className="mr-1 h-3 w-3" />
                    <span>{formatDate(project.creationDate || project.createdAt)}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/projects/${project._id}`}
                      className="flex-grow text-center px-3 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors inline-block"
                    >
                      View Details
                    </Link>
                    
                    {project.status === 'Demandé' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleWithdrawProject(project._id);
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors inline-flex items-center justify-center"
                        title="Withdraw Request"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      );
    }

    // Render list view
    return (
      <>
        {projectCountDisplay}
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project._id}
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4">
                  {project.pictures && project.pictures.length > 0 ? (
                    <img 
                      src={project.pictures[0]} 
                      alt={project.title} 
                      className="w-full h-48 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {project.description ? (
                      project.description.length > 200 
                        ? `${project.description.substring(0, 200)}...` 
                        : project.description
                    ) : 'No description available'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-2 h-4 w-4" />
                      <span>Created: {formatDate(project.creationDate || project.createdAt)}</span>
                    </div>
                    
                    {project.location && project.location.type === 'Point' && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FiMapPin className="mr-2 h-4 w-4" />
                        <span>Location specified</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="mr-2 h-4 w-4" />
                      <span>Last update: {formatDate(project.LastEditDate || project.updatedAt || project.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    {project.status === 'Demandé' && (
                      <button
                        onClick={() => handleWithdrawProject(project._id)}
                        className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        title="Withdraw Request"
                      >
                        <FiTrash2 className="mr-2 h-4 w-4" />
                        Withdraw
                      </button>
                    )}
                    <Link 
                      to={`/projects/${project._id}`}
                      className="inline-flex items-center px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
                    >
                      <FiInfo className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </>
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
          <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
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
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={yearFilter}
                    onChange={handleYearFilterChange}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coquelicot-500 appearance-none bg-white"
                  >
                    <option value="">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={monthFilter}
                    onChange={handleMonthFilterChange}
                    disabled={!yearFilter}
                    className={`w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coquelicot-500 appearance-none bg-white ${!yearFilter ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex justify-end">
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md p-1">
                <button
                  onClick={() => toggleViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-coquelicot text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Grid View"
                >
                  <FiGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => toggleViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-coquelicot text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="List View"
                >
                  <FiList className="h-5 w-5" />
                </button>
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
            to="/request-project"
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
