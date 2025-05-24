import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiMap, FiTag } from 'react-icons/fi';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker } from 'react-map-gl';
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

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

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
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
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
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-silver-200 hover:text-silver-100 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Projects
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coquelicot"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-600 bg-red-50 rounded-md">{error}</div>
      ) : project ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-silver-100">{project.title}</h1>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/admin/projects/edit/${project._id}`}
                      className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-colors"
                    >
                      <FiEdit />
                    </Link>
                    <button 
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      onClick={deleteProject}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
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
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {project.pictures.map((img, index) => (
                            <button 
                              key={index}
                              className={`h-16 w-16 rounded-md overflow-hidden border-2 flex-shrink-0 ${index === activeImage ? 'border-coquelicot' : 'border-transparent'}`}
                              onClick={() => setActiveImage(index)}
                            >
                              <img 
                                src={img} 
                                alt={`Thumbnail ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-100 h-60 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No images available</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-silver-100 mb-2">Description</h2>
                  <p className="text-silver-200 whitespace-pre-line">{project.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 mr-3">
                      <FiCalendar />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{formatDate(project.creationDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 mr-3">
                      <FiClock />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(project.LastEditDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 mr-3">
                      <FiTag />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{project.categoryId?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {project.location && project.location.coordinates && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-silver-100 mb-2 flex items-center">
                      <FiMap className="mr-2" /> Project Location
                    </h2>
                    <div className="h-60 rounded-lg overflow-hidden">
                      <Map
                        initialViewState={{
                          longitude: project.location.coordinates[0],
                          latitude: project.location.coordinates[1],
                          zoom: 13
                        }}
                        style={{ width: '100%', height: '100%' }}
                        mapStyle="mapbox://styles/mapbox/streets-v11"
                        mapboxAccessToken={mapboxToken}
                        attributionControl={true}
                      >
                        <Marker
                          longitude={project.location.coordinates[0]}
                          latitude={project.location.coordinates[1]}
                          color="#EF4444"
                        />
                      </Map>
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
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-silver-100 mb-4">User Information</h2>
                {project.userId ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <img
                        src={project.userId.picture || 'https://via.placeholder.com/60x60?text=User'}
                        alt={project.userId.name}
                        className="h-16 w-16 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-medium text-silver-100">{project.userId.name}</h3>
                        <p className="text-silver-200 text-sm">
                          {project.userId.role === 'admin' ? 'Administrator' : 'Client'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FiMail className="text-gray-400 mr-2" />
                        <a href={`mailto:${project.userId.email}`} className="text-blue-600 hover:underline">
                          {project.userId.email}
                        </a>
                      </div>
                      {project.userId.phoneNumber && (
                        <div className="flex items-center">
                          <FiPhone className="text-gray-400 mr-2" />
                          <a href={`tel:${project.userId.phoneNumber}`} className="text-blue-600 hover:underline">
                            {project.userId.phoneNumber}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" />
                        <span className="text-silver-200">
                          Member since {new Date(project.userId.creationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-silver-200">No user information available</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-silver-100 mb-4">Actions</h2>
                <div className="space-y-3">
                  <Link
                    to={`/admin/projects/edit/${project._id}`}
                    className="w-full flex items-center justify-center gap-2 bg-coquelicot hover:bg-coquelicot-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    <FiEdit /> Edit Project
                  </Link>
                  <button
                    onClick={deleteProject}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md transition-colors"
                  >
                    <FiTrash2 /> Delete Project
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-silver-200">Project not found</div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
