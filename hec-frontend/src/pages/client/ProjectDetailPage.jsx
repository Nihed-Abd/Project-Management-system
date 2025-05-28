import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiTag, FiClock, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox token from environment variables
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation(['common', 'projects']);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  
  // Refs for the map container and map instance
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/public/projects/${projectId}`);
        
        if (response.data) {
          setProject(response.data.project || response.data);
        } else {
          setError(t('projects.errors.notFound'));
        }
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(t('projects.errors.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Initialize and set up the map when project data with location is loaded
  useEffect(() => {
    // Make sure we have all the prerequisites for creating the map
    if (
      !project || 
      !project.location || 
      !project.location.coordinates || 
      !mapContainer.current || 
      !process.env.REACT_APP_MAPBOX_TOKEN
    ) {
      return;
    }
    
    // Get the coordinates from the project
    const longitude = project.location.coordinates[0];
    const latitude = project.location.coordinates[1];
    
    // Wait a small amount of time to ensure the container is fully rendered
    const timer = setTimeout(() => {
      // If map already exists, remove it first to avoid duplicate maps
      if (map.current) {
        map.current.remove();
      }
      
      // Create new map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
        center: [longitude, latitude],
        zoom: 14,
        pitch: 60, // 3D Effect with tilted view
        bearing: 30, // Rotate the map slightly
        attributionControl: false,
        preserveDrawingBuffer: true // Important for some browsers
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Create a marker at the project location
      new mapboxgl.Marker({ color: '#FF5722' })
        .setLngLat([longitude, latitude])
        .addTo(map.current);
      
      // Add 3D building layer for a more immersive view
      map.current.on('load', () => {
        // Check if map still exists
        if (!map.current) return;
        
        // Add 3D buildings if they don't already exist
        if (!map.current.getLayer('3d-buildings')) {
          map.current.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 12,
            'paint': {
              'fill-extrusion-color': isDark ? '#242F3E' : '#aaa',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.7
            }
          });
        }
        
        // Force a repaint to ensure everything is visible
        map.current.triggerRepaint();
        setMapLoaded(true);
      });
      
      // Handle resize events to keep the map properly sized
      const resizeMap = () => {
        if (map.current) {
          map.current.resize();
        }
      };
      
      window.addEventListener('resize', resizeMap);
      
      // Clean up on unmount
      return () => {
        window.removeEventListener('resize', resizeMap);
        clearTimeout(timer);
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }, 300); // Short delay to ensure container is ready
    
    return () => clearTimeout(timer);
  }, [project, isDark]);

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 pb-16 flex justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <motion.div 
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-coquelicot"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={`min-h-screen pt-24 pb-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error || t('projects.errors.notFound')}</p>
            <Link 
              to="/projects"
              className="inline-flex items-center text-coquelicot hover:underline"
            >
              <FiArrowLeft className="mr-2" /> {t('projects.backToProjects')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            to="/projects"
            className="inline-flex items-center text-coquelicot hover:underline"
          >
            <FiArrowLeft className="mr-2" /> {t('projects.backToProjects')}
          </Link>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{project.title}</h1>
          <div className={`flex flex-wrap gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center">
              <FiCalendar className="mr-1 text-gray-400" />
              <span>{t('common.created')}: {new Date(project.creationDate || project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <FiTag className="mr-1 text-gray-400" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'terminé' ? 'bg-green-100 text-green-800' :
                project.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                project.status === 'Accepteé' ? 'bg-blue-100 text-blue-800' :
                project.status === 'Demandé' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {project.status}
              </span>
            </div>
            {project.LastEditDate && (
              <div className="flex items-center">
                <FiClock className="mr-1 text-gray-400" />
                <span>{t('common.updated')}: {new Date(project.LastEditDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Project Media Gallery */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className={`rounded-xl p-4 md:p-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {project.pictures && project.pictures.length > 0 ? (
              <>
                <div className="relative rounded-xl overflow-hidden h-64 md:h-80 lg:h-96 mb-4 shadow-md">
                  <img 
                    src={project.pictures[activeImage]} 
                    alt={`${project.title} - Image ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {project.pictures.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {project.pictures.map((pic, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${activeImage === index ? 'border-coquelicot' : 'border-transparent'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={pic} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={`flex items-center justify-center h-64 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('projects.noImagesAvailable')}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('projectDetails', { ns: 'projects' })}</h2>
            <div className={`prose prose-lg max-w-none ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>{project.description || t('noDescriptionAvailable', { ns: 'projects' })}</p>
            </div>
            
            {project.location && project.location.coordinates && (
              <div className="mt-10">
                <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <div className="flex items-center">
                    <FiMapPin className="mr-2" /> {t('mapLocation', { ns: 'projects' })}
                  </div>
                </h2>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`relative h-72 rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  style={{ position: 'relative', width: '100%' }}
                >
                  <div 
                    ref={mapContainer} 
                    className="absolute inset-0 w-full h-full"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-opacity-70 bg-gray-900">
                      <motion.div
                        className="rounded-full h-10 w-10 border-t-2 border-b-2 border-coquelicot mb-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-white">{t('loadingMap', { ns: 'common' })}</p>
                    </div>
                  )}
                </motion.div>
                <div className="mt-2 flex justify-between text-xs">
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    <span className="font-medium">{t('coordinates', { ns: 'projects' })}:</span> {project.location.coordinates[1]}, {project.location.coordinates[0]}
                  </p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    <span className="italic">{t('mapControls', { ns: 'common' })}</span>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 shadow-gray-900/50' : 'bg-gray-50'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('projectInfo', { ns: 'projects' })}</h2>
              
              {project.categoryId && (
                <div className="mb-4">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('fields.category', { ns: 'projects' })}</h3>
                  <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>{project.categoryId.name || t('unknown', { ns: 'common' })}</p>
                </div>
              )}
              
              {project.userId && (
                <div className="mb-4">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('fields.client', { ns: 'projects' })}</h3>
                  <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>{project.userId.name || t('unknownClient', { ns: 'projects' })}</p>
                </div>
              )}
              
              <div className="mt-6">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link 
                    to="/request-project" 
                    className="block w-full text-center bg-coquelicot hover:bg-coquelicot-600 text-white py-3 px-4 rounded-lg transition-all duration-300 shadow-md"
                  >
                    {t('requestSimilar', { ns: 'projects' })}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
