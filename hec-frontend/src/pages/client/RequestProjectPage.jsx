import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiImage, FiX, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker } from 'react-map-gl';
import Swal from 'sweetalert2';



const RequestProjectPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation(['common', 'request']);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Location state
  const [location, setLocation] = useState({
    type: 'Point',
    coordinates: [10.183333, 36.8] // Default to Tunisia coordinates
  });
  const [viewport, setViewport] = useState({
    latitude: 36.8,
    longitude: 10.183333,
    zoom: 9
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          if (response.data.length > 0) {
            setCategoryId(response.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Limit to 5 images max
      if (imageFiles.length + selectedFiles.length > 5) {
        Swal.fire({
          icon: 'warning',
          title: t('errors.title', { ns: 'request' }),
          text: t('errors.tooManyImages', { ns: 'request' }),
        });
        return;
      }

      // Create preview URLs
      const newImageUrls = [...imageUrls];
      selectedFiles.forEach((file) => {
        newImageUrls.push(URL.createObjectURL(file));
      });

      setImageFiles([...imageFiles, ...selectedFiles]);
      setImageUrls(newImageUrls);
    }
  };

  // Remove an image
  const removeImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImageUrls = [...imageUrls];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index]);

    newImageFiles.splice(index, 1);
    newImageUrls.splice(index, 1);

    setImageFiles(newImageFiles);
    setImageUrls(newImageUrls);
  };

  // Upload images and get URLs
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    const uploadedUrls = [];
    const formData = new FormData();

    // Append each file to form data with the correct field name 'images'
    // This must match what the backend expects in upload.route.js
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload/multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.fileUrls) {
        return response.data.fileUrls;
      }
      return [];
    } catch (err) {
      console.error('Error uploading images:', err);
      throw new Error('Failed to upload images: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle map click to set marker position
  const handleMapClick = (event) => {
    setLocation({
      type: 'Point',
      coordinates: [event.lngLat.lng, event.lngLat.lat],
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Please log in to request a project',
      });
      navigate('/login');
      return;
    }

    if (!title.trim()) {
      Swal.fire({
        icon: 'error',
        title: t('errors.title', { ns: 'request' }),
        text: t('errors.titleRequired', { ns: 'request' }),
      });
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      Swal.fire({
        icon: 'error',
        title: t('errors.title', { ns: 'request' }),
        text: t('errors.descriptionRequired', { ns: 'request' }),
      });
      setLoading(false);
      return;
    }

    if (!categoryId) {
      Swal.fire({
        icon: 'error',
        title: t('errors.title', { ns: 'request' }),
        text: t('errors.categoryRequired', { ns: 'request' }),
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload images first if any
      const pictureUrls = await uploadImages();

      // 2. Prepare project data
      const projectData = {
        title,
        description,
        categoryId,
        userId: currentUser._id,
        status: 'Demandé', // Default status for new projects
        pictures: pictureUrls,
        location, // Include location data from state
      };

      // 4. Submit project request
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/projects`,
        projectData
      );

      if (response.data && (response.data.success || response.data.project)) {
        Swal.fire({
          icon: 'success',
          title: t('success.title', { ns: 'request' }),
          text: t('success.message', { ns: 'request' }),
          confirmButtonText: t('success.button', { ns: 'request' }),
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/projects');
          }
        });
      } else {
        throw new Error('Failed to create project');
      }
    } catch (err) {
      console.error('Error submitting project request:', err);
      setError('Failed to submit your project request. Please try again later.');
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.message || 'An error occurred while submitting your project request',
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  const inputVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen pt-24 pb-16 ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
        <div className="container mx-auto px-4 text-center py-20">
          <div className="text-center py-12">
            <p className={`text-gray-600 mb-4 ${isDark ? 'text-gray-300' : ''}`}>Please log in to request a project.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-24 ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {t('title', { ns: 'request' })}
          </h1>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            {t('description', { ns: 'request' })}
          </p>
        </motion.div>

        <motion.div
          className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800 shadow-gray-700/10' : 'bg-white shadow-gray-200/50'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
        >
          {error && (
            <div className={`p-4 rounded-md mb-6 ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-800'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <motion.div variants={inputVariants}>
              <label htmlFor="title" className={`block text-sm font-medium text-gray-700 mb-1 ${isDark ? 'text-gray-300' : ''}`}>
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`block w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-700 placeholder-gray-500'}`}
                placeholder={t('form.titlePlaceholder', { ns: 'request' })}
                required
              />
            </motion.div>

            {/* Project Description */}
            <motion.div variants={inputVariants}>
              <label htmlFor="description" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Project Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`block w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-transparent resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-700 placeholder-gray-500'}`}
                placeholder={t('form.descriptionPlaceholder', { ns: 'request' })}
                required
              />
            </motion.div>

            {/* Category Selection */}
            <motion.div variants={inputVariants}>
              <label htmlFor="category" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Project Category *
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`block w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
                required
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {t('form.categoryPlaceholder', { ns: 'request' })}
                  </option>
                )}
              </select>
            </motion.div>

            {/* Images Upload */}
            <motion.div variants={inputVariants}>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.images', { ns: 'request' })}
              </label>
              <div className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                <FiImage className={`h-10 w-10 mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Drag and drop images here, or click to select files
                </p>
                <input
                  type="file"
                  id="images"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('images').click()}
                  className={`px-4 py-2 rounded-md transition-colors text-sm ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('form.selectImages', { ns: 'request' })}
                </button>
              </div>
              
              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Location Selection */}
            <motion.div variants={inputVariants}>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('form.location', { ns: 'request' })}
              </label>
              <div className={`rounded-md overflow-hidden h-80 ${isDark ? 'border border-gray-700' : 'border border-gray-300'}`}>
                <Map
                  initialViewState={{
                    longitude: viewport.longitude,
                    latitude: viewport.latitude,
                    zoom: viewport.zoom
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  mapboxAccessToken={mapboxToken}
                  attributionControl={true}
                  onClick={handleMapClick}
                >
                  <Marker
                    longitude={location.coordinates[0]}
                    latitude={location.coordinates[1]}
                    color="#EF4444"
                    draggable
                    onDragEnd={(event) => {
                      setLocation({
                        type: 'Point',
                        coordinates: [event.lngLat.lng, event.lngLat.lat]
                      });
                    }}
                  />
                </Map>
              </div>
              <div className={`mt-2 flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <FiInfo className="mr-2 h-4 w-4" />
                <span>{t('form.locationCoordinates', { ns: 'request', lat: location.coordinates[1].toFixed(6), lng: location.coordinates[0].toFixed(6) })}</span>
              </div>
              <div className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>{t('form.locationHelp', { ns: 'request' })}</span>
              </div>
            </motion.div>
            
            {/* Submit Button */}
            <motion.div variants={inputVariants} className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-coquelicot text-white rounded-md shadow-md hover:bg-coquelicot-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? t('form.submitting', { ns: 'request' }) : t('form.submit', { ns: 'request' })}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RequestProjectPage;
