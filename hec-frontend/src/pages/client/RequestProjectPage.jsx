import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiImage, FiX, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker } from 'react-map-gl';
import Swal from 'sweetalert2';



const RequestProjectPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  
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
          title: 'Too many images',
          text: 'You can upload a maximum of 5 images',
        });
        return;
      }
      
      // Create preview URLs
      const newImageUrls = [...imageUrls];
      selectedFiles.forEach(file => {
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
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload/multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
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
      coordinates: [event.lngLat.lng, event.lngLat.lat]
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
    
    if (!title || !description || !categoryId) {
      setError('Please fill in all required fields');
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
        location // Include location data from state
      };
      
      // 4. Submit project request
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/projects`,
        projectData
      );
      
      if (response.data && response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Project Requested',
          text: 'Your project request has been submitted successfully!',
        });
        navigate('/user-projects');
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
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };
  
  const inputVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-gray-600 mb-4">Please log in to request a project.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Request a New Project</h1>
          <p className="text-gray-600 mb-8">
            Fill in the details below to request a new electrical project with HEC Tunisia.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <motion.div variants={inputVariants}>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-coquelicot"
                placeholder="e.g. Home Electrical Installation"
                required
              />
            </motion.div>
            
            {/* Project Description */}
            <motion.div variants={inputVariants}>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-coquelicot"
                placeholder="Describe your project requirements in detail..."
                required
              />
            </motion.div>
            
            {/* Category Selection */}
            <motion.div variants={inputVariants}>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Project Category *
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-coquelicot"
                required
              >
                {categories.length > 0 ? (
                  categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="">Loading categories...</option>
                )}
              </select>
            </motion.div>
            
            {/* Images Upload */}
            <motion.div variants={inputVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Images (Max 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <FiImage className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                  Select Images
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Location (Optional)
              </label>
              <div className="border border-gray-300 rounded-md overflow-hidden h-80">
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
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <FiInfo className="mr-2 h-4 w-4" />
                <span>Location selected at: {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                <span>Click on the map to set project location or drag the marker</span>
              </div>
            </motion.div>
            
            {/* Submit Button */}
            <motion.div variants={inputVariants} className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-coquelicot text-white rounded-md shadow-md hover:bg-coquelicot-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Project Request'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RequestProjectPage;
