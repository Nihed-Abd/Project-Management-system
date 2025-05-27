import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiFilter, FiEye, FiEdit, FiTrash2, FiUser, FiCalendar, FiTag, FiClock } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Swal from 'sweetalert2';

// Add global styles for SweetAlert buttons when component loads
const sweetAlertStyles = document.createElement('style');
sweetAlertStyles.innerHTML = `
  .swal2-styled.swal2-confirm {
    background-color: #EF4444 !important;
    color: white !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    padding: 10px 24px !important;
    border-radius: 8px !important;
  }
  .swal2-styled.swal2-cancel {
    background-color: #64748B !important;
    color: white !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    padding: 10px 24px !important;
    border-radius: 8px !important;
  }
`;
document.head.appendChild(sweetAlertStyles);

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  // Apply filters when search query, status filter, or date filters change
  useEffect(() => {
    if (searchQuery) {
      // If search query exists, use the backend search endpoint
      searchProjects(searchQuery);
    } else {
      // Otherwise apply local filters to all projects
      let filtered = [...projects];
      
      // Apply status filter if selected
      if (statusFilter) {
        filtered = filtered.filter(project => project.status === statusFilter);
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
      
      // Apply category filter if selected
      if (categoryFilter) {
        filtered = filtered.filter(project => {
          // Handle different possible data structures for categoryId
          // It could be a string, an object with _id, or a direct reference
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
      
      setFilteredProjects(filtered);
    }
  }, [searchQuery, statusFilter, yearFilter, monthFilter, categoryFilter, projects]);

  // Fetch all projects from the API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects`);
      // Handle both formats - array directly or wrapped in success object
      if (Array.isArray(response.data)) {
        console.log('Projects data:', response.data);
        // Check the first project to examine its structure
        if (response.data.length > 0) {
          console.log('First project structure:', response.data[0]);
          console.log('Category ID type:', typeof response.data[0].categoryId);
        }
        setProjects(response.data);
        setFilteredProjects(response.data);
      } else if (response.data.success && Array.isArray(response.data.projects)) {
        console.log('Projects data:', response.data.projects);
        // Check the first project to examine its structure
        if (response.data.projects.length > 0) {
          console.log('First project structure:', response.data.projects[0]);
          console.log('Category ID type:', typeof response.data.projects[0].categoryId);
        }
        setProjects(response.data.projects);
        setFilteredProjects(response.data.projects);
      } else {
        setError('Failed to fetch projects: Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching projects');
    } finally {
      setLoading(false);
    }
  };

  // Search for projects by user name, email, or phone
  const searchProjects = async (query) => {
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/search?query=${query}`);
      // Handle both formats - array directly or wrapped in success object
      let filtered = [];
      if (Array.isArray(response.data)) {
        filtered = response.data;
      } else if (response.data.success && Array.isArray(response.data.projects)) {
        filtered = response.data.projects;
      } else {
        setError('Search failed: Unexpected response format');
        setLoading(false);
        return;
      }
      
      // Apply status filter to search results if needed
      if (statusFilter) {
        filtered = filtered.filter(project => project.status === statusFilter);
      }
      setFilteredProjects(filtered);
    } catch (err) {
      console.error('Error searching projects:', err);
      setError(err.response?.data?.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
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
    setYearFilter(e.target.value);
    // Reset month filter when year changes
    if (!e.target.value) {
      setMonthFilter('');
    }
  };
  
  // Handle month filter change
  const handleMonthFilterChange = (e) => {
    setMonthFilter(e.target.value);
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };
  
  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
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
  
  // Get month name from number
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  // View project details
  const viewProjectDetails = (projectId) => {
    navigate(`/admin/projects/${projectId}`);
  };
  
  // Delete project function
  const deleteProject = async (projectId, projectTitle) => {
    try {
      // Show confirmation dialog with SweetAlert2
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete the project "${projectTitle}". This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: true
      });
      
      // If user confirmed, proceed with deletion
      if (result.isConfirmed) {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`);
        
        if (response.data && response.data.success) {
          // Show success message
          await Swal.fire({
            title: 'Deleted!',
            text: 'Project has been deleted successfully.',
            icon: 'success',
            confirmButtonColor: '#10B981'
          });
          
          // Refresh project list
          fetchProjects();
        } else {
          throw new Error(response.data?.message || 'Failed to delete project');
        }
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      
      // Show error message
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to delete project',
        icon: 'error',
        confirmButtonColor: '#3B82F6'
      });
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Change project status
  const changeProjectStatus = async (projectId, newStatus, projectTitle) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`, {
        status: newStatus
      });
      
      // Update local state
      const updatedProjects = projects.map(p => {
        if (p._id === projectId) {
          return { ...p, status: newStatus };
        }
        return p;
      });
      
      setProjects(updatedProjects);
      
      // Show success toast
      Swal.fire({
        title: 'Status Updated',
        text: `Project "${projectTitle}" status changed to ${newStatus}`,
        icon: 'success',
        confirmButtonColor: '#10B981',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update project status',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Demandé':
        return 'bg-blue-100 text-blue-800';
      case 'Accepteé':
        return 'bg-yellow-100 text-yellow-800';
      case 'En cours':
        return 'bg-purple-100 text-purple-800';
      case 'terminé':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Available project statuses
  const projectStatuses = ["Demandé", "Accepteé", "En cours", "terminé"];

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>Projects</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-silver-200'}`}>Manage all projects from one place</p>
        </div>
        <Link
          to="/admin/projects/add"
          className="mt-4 md:mt-0 flex items-center gap-2 bg-coquelicot hover:bg-coquelicot-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          <FiPlus /> Add New Project
        </Link>
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-sm border overflow-hidden`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} flex flex-col md:flex-row gap-4`}>
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user name, email or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`block w-full pl-10 pr-4 py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'} rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500`}
            />
          </div>
          <div className="flex space-x-2">
            {/* Status filter */}
            <div className="relative">
              <select
                className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="Demandé">Demandé</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Annulé">Annulé</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <FiFilter className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`} />
              </div>
            </div>
            
            {/* Year filter */}
            <div className="relative">
              <select
                className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                value={yearFilter}
                onChange={handleYearFilterChange}
              >
                <option value="">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <FiCalendar className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`} />
              </div>
            </div>
            
            {/* Category filter */}
            <div className="relative">
              <select
                className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <FiTag className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`} />
              </div>
            </div>
            
            {/* Month filter - only enabled if year is selected */}
            <div className="relative">
              <select
                className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!yearFilter ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={monthFilter}
                onChange={handleMonthFilterChange}
                disabled={!yearFilter}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{getMonthName(month)}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <FiClock className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coquelicot"></div>
          </div>
        ) : error ? (
          <div className={`p-4 text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 text-center">
            <p className={`${isDark ? 'text-gray-400' : 'text-silver-200'} mb-4`}>No projects found</p>
            <Link
              to="/admin/projects/add"
              className="inline-flex items-center gap-2 bg-coquelicot hover:bg-coquelicot-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <FiPlus /> Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Project
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    User
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Category
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Created
                  </th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                {filteredProjects.map((project) => (
                  <motion.tr
                    key={project._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}
                    onClick={() => viewProjectDetails(project._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={project.pictures && project.pictures.length > 0 ? project.pictures[0] : 'https://via.placeholder.com/40x40?text=HEC'}
                            alt={project.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.title}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate max-w-xs`}>{project.description.substring(0, 60)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 mr-3">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={project.userId?.picture || 'https://via.placeholder.com/32x32?text=User'}
                            alt={project.userId?.name}
                          />
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.userId?.name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{project.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className="inline-flex items-center gap-1">
                          <FiTag className={`${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                          {project.categoryId?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button" 
                          className={`inline-flex w-full justify-between items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(project.status)} hover:bg-opacity-90 focus:outline-none shadow-sm border border-white`}
                          id={`status-button-${project._id}`}
                          aria-expanded="true"
                          aria-haspopup="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Close all other open dropdowns first
                            document.querySelectorAll('[id^="status-dropdown-"]').forEach(el => {
                              if (el.id !== `status-dropdown-${project._id}`) {
                                el.classList.add('hidden');
                              }
                            });
                            // Toggle current dropdown
                            const dropdown = document.getElementById(`status-dropdown-${project._id}`);
                            dropdown.classList.toggle('hidden');
                          }}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full" style={{
                              backgroundColor: project.status === 'Demandé' ? '#3B82F6' : 
                                            project.status === 'Accepteé' ? '#F59E0B' : 
                                            project.status === 'En cours' ? '#8B5CF6' : 
                                            project.status === 'terminé' ? '#10B981' : '#9CA3AF'
                            }}></span>
                            {project.status}
                          </span>
                          <svg className="h-4 w-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        <div 
                          id={`status-dropdown-${project._id}`}
                          className="absolute right-0 z-50 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-200 focus:outline-none hidden overflow-hidden"
                          role="menu" 
                          aria-orientation="vertical" 
                          aria-labelledby={`status-button-${project._id}`}
                        >
                          <div className="py-1" role="none">
                            {projectStatuses.map(status => {
                              const statusColor = status === 'Demandé' ? '#3B82F6' : 
                                              status === 'Accepteé' ? '#F59E0B' : 
                                              status === 'En cours' ? '#8B5CF6' : 
                                              status === 'terminé' ? '#10B981' : '#9CA3AF';
                              
                              return (
                                <button
                                  key={status}
                                  className={`w-full text-left flex items-center px-4 py-2 text-sm ${project.status === status ? 'bg-gray-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                  role="menuitem"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (project.status !== status) {
                                      changeProjectStatus(project._id, status, project.title);
                                    }
                                    document.getElementById(`status-dropdown-${project._id}`).classList.add('hidden');
                                  }}
                                >
                                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: statusColor }}></span>
                                  {status}
                                  {project.status === status && (
                                    <svg className="ml-auto h-4 w-4 text-coquelicot" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        <FiCalendar className={`${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                        {formatDate(project.creationDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewProjectDetails(project._id);
                          }}
                        >
                          <FiEye className="text-xl" />
                        </button>
                        <Link 
                          to={`/admin/projects/edit/${project._id}`}
                          className="text-amber-600 hover:text-amber-900 p-2 hover:bg-amber-50 rounded-full transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiEdit className="text-xl" />
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project._id, project.title);
                          }}
                        >
                          <FiTrash2 className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
