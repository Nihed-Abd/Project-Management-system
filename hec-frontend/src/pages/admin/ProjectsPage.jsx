import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiFilter, FiEye, FiEdit, FiTrash2, FiUser, FiCalendar, FiTag, FiClock } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Apply filters when search query or status filter changes
  useEffect(() => {
    if (searchQuery) {
      // If search query exists, use the backend search endpoint
      searchProjects(searchQuery);
    } else {
      // Otherwise apply local status filter to all projects
      let filtered = [...projects];
      if (statusFilter) {
        filtered = filtered.filter(project => project.status === statusFilter);
      }
      setFilteredProjects(filtered);
    }
  }, [searchQuery, statusFilter, projects]);

  // Fetch all projects from the API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects`);
      // Handle both formats - array directly or wrapped in success object
      if (Array.isArray(response.data)) {
        setProjects(response.data);
        setFilteredProjects(response.data);
      } else if (response.data.success && Array.isArray(response.data.projects)) {
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

  // View project details
  const viewProjectDetails = (projectId) => {
    navigate(`/admin/projects/${projectId}`);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Demandé':
        return 'bg-blue-100 text-blue-800';
      case 'Accepteé':
        return 'bg-green-100 text-green-800';
      case 'En cours':
        return 'bg-amber-100 text-amber-800';
      case 'terminé':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-silver-100">Projects</h1>
          <p className="text-silver-200">Manage all projects from one place</p>
        </div>
        <Link
          to="/admin/projects/add"
          className="mt-4 md:mt-0 flex items-center gap-2 bg-coquelicot hover:bg-coquelicot-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          <FiPlus /> Add New Project
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user name, email or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500"
            />
          </div>
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="Demandé">Demandé</option>
              <option value="Accepteé">Accepteé</option>
              <option value="En cours">En cours</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coquelicot"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-silver-200 mb-4">No projects found</p>
            <Link
              to="/admin/projects/add"
              className="inline-flex items-center gap-2 bg-coquelicot hover:bg-coquelicot-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <FiPlus /> Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <motion.tr
                    key={project._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50 cursor-pointer"
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
                          <div className="text-sm font-medium text-gray-900">{project.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{project.description.substring(0, 60)}...</div>
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
                          <div className="text-sm font-medium text-gray-900">{project.userId?.name}</div>
                          <div className="text-sm text-gray-500">{project.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="inline-flex items-center gap-1">
                          <FiTag className="text-gray-400" />
                          {project.categoryId?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <FiCalendar className="text-gray-400" />
                        {formatDate(project.creationDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewProjectDetails(project._id);
                          }}
                        >
                          <FiEye />
                        </button>
                        <Link 
                          to={`/admin/projects/edit/${project._id}`}
                          className="text-amber-600 hover:text-amber-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiEdit />
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete functionality can be added here
                          }}
                        >
                          <FiTrash2 />
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
