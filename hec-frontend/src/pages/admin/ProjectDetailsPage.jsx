import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiMap, FiTag } from 'react-icons/fi';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker } from 'react-map-gl';
import Swal from 'sweetalert2';
import { useTheme } from '../../context/ThemeContext';

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

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Delete project function
  const deleteProject = async () => {
    try {
      // Show confirmation dialog with SweetAlert2
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
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
          
          // Navigate back to projects list
          navigate('/admin/projects');
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

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`);
      // Handle both formats - object directly or wrapped in success object
      if (response.data && !response.data.success && response.data._id) {
        // Direct object response
        setProject(response.data);
      } else if (response.data.success && response.data.project) {
        // Wrapped in success object
        setProject(response.data.project);
      } else {
        setError('Failed to fetch project details: Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching project details');
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
  
  // Change project status
  const changeProjectStatus = async (newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`, {
        status: newStatus
      });
      
      // Update local state
      setProject(prev => ({
        ...prev,
        status: newStatus
      }));
      
      // Show success toast
      Swal.fire({
        title: 'Status Updated',
        text: `Project status changed to ${newStatus}`,
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

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : ''}`}>
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className={`flex items-center transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-silver-200 hover:text-silver-100'}`}
        >
          <FiArrowLeft className="mr-2" /> Back to Projects
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coquelicot"></div>
        </div>
      ) : error ? (
        <div className={`p-4 text-center rounded-md ${isDark ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50'}`}>{error}</div>
      ) : project ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-lg shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <div className="p-6">
                <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-silver-100'}`}>{project.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className={isDark ? 'text-gray-400' : 'text-gray-400'} />
                    <span className={isDark ? 'text-gray-300' : 'text-silver-200'}>Created on {formatDate(project.creationDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FiClock className={isDark ? 'text-gray-400' : 'text-gray-400'} />
                    <span className={isDark ? 'text-gray-300' : 'text-silver-200'}>Last updated on {formatDate(project.LastEditDate)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className={isDark ? 'text-gray-300' : 'text-silver-200'}>Status:</div>
                    <div className="relative inline-block">
                      <button 
                        type="button" 
                        className={`inline-flex justify-between items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(project.status)} hover:bg-opacity-90 focus:outline-none shadow-sm ${isDark ? 'border border-gray-700' : 'border border-white'}`}
                        id="status-button"
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={() => {
                          const dropdown = document.getElementById('status-dropdown');
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
                        <svg className={`h-4 w-4 ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <div 
                        id="status-dropdown"
                        className={`absolute left-0 z-50 mt-1 w-40 origin-top-right rounded-md shadow-lg ring-1 focus:outline-none hidden overflow-hidden ${isDark ? 'bg-gray-800 ring-gray-700' : 'bg-white ring-gray-200'}`}
                        role="menu" 
                        aria-orientation="vertical" 
                        aria-labelledby="status-button"
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
                                className={`w-full text-left flex items-center px-4 py-2 text-sm ${project.status === status ? (isDark ? 'bg-gray-700 font-medium text-white' : 'bg-gray-50 font-medium text-gray-700') : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')}`}
                                role="menuitem"
                                onClick={() => {
                                  if (project.status !== status) {
                                    changeProjectStatus(status);
                                  }
                                  document.getElementById('status-dropdown').classList.add('hidden');
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
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FiTag className="text-gray-400" />
                    <span className={isDark ? 'text-gray-300' : 'text-silver-200'}>
                      Category: {project.categoryId?.name || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  {project.pictures && project.pictures.length > 0 ? (
                    <>
                      <div className="relative mb-4 rounded-lg overflow-hidden h-80">
                        <img 
                          src={project.pictures[activeImage]} 
                          alt={`${project.title} - Image ${activeImage + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {project.pictures.length > 1 && (
                        <div className="flex flex-wrap gap-2">
                          {project.pictures.map((pic, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveImage(index)}
                              className={`w-16 h-16 rounded-md overflow-hidden border-2 ${index === activeImage ? 'border-coquelicot' : (isDark ? 'border-gray-700' : 'border-transparent')}`}
                            >
                              <img 
                                src={pic} 
                                alt={`Thumbnail ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-100 rounded-lg h-60 flex items-center justify-center">
                      <p className="text-gray-500">No images available</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-silver-100'}`}>Description</h2>
                  <p className={`whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-silver-200'}`}>{project.description}</p>
                </div>

                {project.location && project.location.coordinates && (
                  <div className="mb-6">
                    <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-silver-100'}`}>Location</h2>
                    <div className="h-64 rounded-lg overflow-hidden">
                      {mapboxToken ? (
                        <Map
                          mapboxAccessToken={mapboxToken}
                          initialViewState={{
                            longitude: project.location.coordinates[0],
                            latitude: project.location.coordinates[1],
                            zoom: 14
                          }}
                          style={{ width: '100%', height: '100%' }}
                          mapStyle={isDark ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11"}
                        >
                          <Marker
                            longitude={project.location.coordinates[0]}
                            latitude={project.location.coordinates[1]}
                            color="#fe3201"
                          />
                        </Map>
                      ) : (
                        <div className={`h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Mapbox token not available</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center">
                      <FiMap className="text-gray-400 mr-2" />
                      <span className={isDark ? 'text-gray-300' : 'text-silver-200'}>
                        Coordinates: {project.location.coordinates[1]}, {project.location.coordinates[0]}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`rounded-lg shadow-sm border overflow-hidden mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-silver-100'}`}>User Information</h2>
                {project.userId ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <img
                        src={project.userId.picture || 'https://via.placeholder.com/60x60?text=User'}
                        alt={project.userId.name}
                        className="h-16 w-16 rounded-full mr-4"
                      />
                      <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-silver-100'}`}>{project.userId.name}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-silver-200'}`}>
                          {project.userId.role === 'admin' ? 'Administrator' : 'Client'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FiMail className="text-gray-400 mr-2" />
                        <a href={`mailto:${project.userId.email}`} className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {project.userId.email}
                        </a>
                      </div>
                      {project.userId.phoneNumber && (
                        <div className="flex items-center">
                          <FiPhone className="text-gray-400 mr-2" />
                          <a href={`tel:${project.userId.phoneNumber}`} className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {project.userId.phoneNumber}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" />
                        <span className={isDark ? 'text-gray-300' : 'text-silver-200'}>
                          Member since {new Date(project.userId.creationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className={isDark ? 'text-gray-300' : 'text-silver-200'}>No user information available</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`rounded-lg shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-silver-100'}`}>Actions</h2>
                <div className="space-y-3">
                  <Link
                    to={`/admin/projects/edit/${project._id}`}
                    className="w-full flex items-center justify-center gap-2 bg-coquelicot hover:bg-coquelicot-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    <FiEdit /> Edit Project
                  </Link>
                  <button
                    onClick={deleteProject}
                    className={`w-full flex items-center justify-center gap-2 border px-4 py-2 rounded-md transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-red-400 border-red-500' : 'bg-white hover:bg-red-50 text-red-600 border-red-200'}`}
                  >
                    <FiTrash2 /> Delete Project
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-silver-200'}`}>Project not found</div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
