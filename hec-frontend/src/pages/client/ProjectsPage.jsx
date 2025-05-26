import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiChevronRight, FiFilter, FiX, FiCalendar, FiTag } from 'react-icons/fi';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  
  // Fetch projects and categories on component mount
  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);
  
  // Extract available years from projects when they load
  useEffect(() => {
    if (projects.length > 0) {
      const years = new Set();
      projects.forEach(project => {
        if (project.creationDate) {
          const year = new Date(project.creationDate).getFullYear();
          years.add(year);
        }
      });
      // Sort years in descending order (newest first)
      setAvailableYears(Array.from(years).sort((a, b) => b - a));
    }
  }, [projects]);
  
  // Apply filters when category, year, or month filters change
  useEffect(() => {
    if (!loading && projects.length > 0) {
      let filtered = [...projects];
      
      // Apply category filter if selected
      if (categoryFilter) {
        filtered = filtered.filter(project => {
          // Handle different possible data structures for categoryId
          if (!project.categoryId) return false;
          
          // Case 1: categoryId is a string
          if (typeof project.categoryId === 'string') {
            return project.categoryId === categoryFilter;
          }
          // Case 2: categoryId is an object with _id property (populated mongoose reference)
          else if (project.categoryId && typeof project.categoryId === 'object' && project.categoryId._id) {
            return project.categoryId._id.toString() === categoryFilter.toString();
          }
          // Case 3: categoryId is a mongoose ObjectId (needs toString comparison)
          else {
            return project.categoryId.toString() === categoryFilter.toString();
          }
        });
      }
      
      // Apply year filter if selected
      if (yearFilter) {
        filtered = filtered.filter(project => {
          const projectDate = new Date(project.creationDate);
          return projectDate.getFullYear() === parseInt(yearFilter);
        });
      }
      
      // Apply month filter if both year and month are selected
      if (yearFilter && monthFilter) {
        filtered = filtered.filter(project => {
          const projectDate = new Date(project.creationDate);
          return projectDate.getFullYear() === parseInt(yearFilter) && 
                 projectDate.getMonth() === parseInt(monthFilter) - 1; // JavaScript months are 0-indexed
        });
      }
      
      setFilteredProjects(filtered);
    }
  }, [categoryFilter, yearFilter, monthFilter, projects, loading]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/public/projects`);
      
      // Handle different API response formats
      if (response.data && Array.isArray(response.data)) {
        setProjects(response.data);
        setFilteredProjects(response.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.projects)) {
        setProjects(response.data.projects);
        setFilteredProjects(response.data.projects);
      } else {
        setError('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/categories`);
      // API returns array directly, not wrapped in success object
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error('Failed to fetch categories: Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };
  
  // Handle year filter change
  const handleYearFilterChange = (e) => {
    const year = e.target.value;
    setYearFilter(year);
    // Reset month filter if year is cleared
    if (!year) {
      setMonthFilter('');
    }
  };
  
  // Handle month filter change
  const handleMonthFilterChange = (e) => {
    setMonthFilter(e.target.value);
  };
  
  // Get month name from number
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter('');
    setYearFilter('');
    setMonthFilter('');
  };

  // Toggle view mode between grid and list
  const toggleViewMode = (mode) => {
    setViewMode(mode);
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

  // Render functions
  const renderGridView = () => {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {projects.map((project) => (
          <Link 
            to={`/projects/${project._id}`}
            key={project._id}
          >
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100 h-full"
              whileHover={{ y: -5 }}
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
                    project.status === 'terminé' ? 'bg-green-100 text-green-800' :
                    project.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Accepteé' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Demandé' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{project.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {project.description || 'No description available'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(project.creationDate || project.createdAt).toLocaleDateString()}
                  </span>
                  <span 
                    className="text-coquelicot hover:text-coquelicot-700 text-sm font-medium flex items-center"
                  >
                    View Details 
                    <FiChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    );
  };

  const renderListView = () => {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col space-y-4"
      >
        {projects.map((project) => (
          <Link
            to={`/projects/${project._id}`}
            key={project._id}
            className="block w-full"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex"
              whileHover={{ x: 5 }}
            >
              <div className="w-32 sm:w-48 h-auto relative flex-shrink-0">
                {project.pictures && project.pictures.length > 0 ? (
                  <img
                    src={project.pictures[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'terminé' ? 'bg-green-100 text-green-800' :
                    project.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Accepteé' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Demandé' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 flex-grow">
                  {project.description ? (
                    project.description.length > 150 
                      ? `${project.description.substring(0, 150)}...` 
                      : project.description
                  ) : 'No description available'}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-gray-500">
                    {new Date(project.creationDate || project.createdAt).toLocaleDateString()}
                  </span>
                  <span 
                    className="text-coquelicot hover:text-coquelicot-700 text-sm font-medium flex items-center"
                  >
                    View Details 
                    <FiChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    );
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
            onClick={fetchProjects}
            className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (filteredProjects.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-600">No projects found.</p>
        </div>
      );
    }

    return viewMode === 'grid' ? renderGridView() : renderListView();
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 mb-10">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Project Gallery</h1>
            <p className="text-gray-600 text-lg">
              Explore our showcase of electrical excellence - from residential installations to industrial solutions.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* View toggle */}
        <div className="flex justify-end mb-6">
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

        {/* Filters and count */}
        {!loading && !error && (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  <FiFilter className="mr-2" />
                  Filters
                </button>
                {(categoryFilter || yearFilter) && (
                  <button 
                    onClick={resetFilters}
                    className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    title="Reset filters"
                  >
                    <FiX className="mr-2" />
                    Clear
                  </button>
                )}
              </div>
              <div className="text-gray-500 text-sm">
                Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                {(categoryFilter || yearFilter) && ' (filtered)'}
              </div>
            </div>
            
            {/* Filter panel */}
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 rounded-lg p-4 mb-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category filter */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-coquelicot focus:border-coquelicot"
                        value={categoryFilter}
                        onChange={handleCategoryFilterChange}
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <FiTag className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Year filter */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <div className="relative">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-coquelicot focus:border-coquelicot"
                        value={yearFilter}
                        onChange={handleYearFilterChange}
                      >
                        <option value="">All Years</option>
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <FiCalendar className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Month filter - only enabled if year is selected */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <div className="relative">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-coquelicot focus:border-coquelicot disabled:bg-gray-100 disabled:text-gray-400"
                        value={monthFilter}
                        onChange={handleMonthFilterChange}
                        disabled={!yearFilter}
                      >
                        <option value="">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>{getMonthName(month)}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <FiCalendar className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Projects Grid/List */}
        <div className="mt-4">
          {renderContent()}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-coquelicot to-amber-500 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="px-6 py-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need a similar project?</h2>
            <p className="mb-8 max-w-2xl mx-auto">
              Our team of experienced professionals is ready to bring your electrical project to life with quality and expertise.
            </p>
            <Link to="/request-project" className="px-8 py-3 bg-white text-coquelicot font-medium rounded-md shadow hover:bg-gray-100 transition-colors inline-block">
              Request a Project
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsPage;
