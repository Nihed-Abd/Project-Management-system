import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiUpload, FiX, FiMapPin, FiUser, FiSearch, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker } from 'react-map-gl';
import { useTheme } from '../../context/ThemeContext';

const AddProjectPage = () => {
  const navigate = useNavigate();
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
  
  // Theme context
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Project form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Demandé', // Default status
    categoryId: '',
    userId: '',
    createdAt: new Date().toISOString().slice(0, 16), // Default to current date/time in format YYYY-MM-DDThh:mm
  });
  
  // Image upload states
  const [pictures, setPictures] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  
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
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Fetch categories and users on component mount
  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);
  
  // Filter users when search query changes
  useEffect(() => {
    if (userSearchQuery) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [userSearchQuery, users]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
      // API returns array directly, not wrapped in success object
      if (Array.isArray(response.data)) {
        setCategories(response.data);
        // Set default category if available
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: response.data[0]._id }));
        }
      } else {
        console.error('Failed to fetch categories: Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`);
      // The auth endpoint consistently returns users in a success wrapper
      if (response.data && response.data.success && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } else {
        console.error('Failed to fetch users: Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file size limit (5MB)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('One or more images exceed the 5MB size limit');
      return;
    }
    
    // Add new files to the pictures array
    setPictures([...pictures, ...files]);
    
    // Create preview URLs for the new images
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };

  // Remove an image from the selection
  const removeImage = (index) => {
    const newPictures = [...pictures];
    const newPreviewUrls = [...imagePreviewUrls];
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newPictures.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setPictures(newPictures);
    setImagePreviewUrls(newPreviewUrls);
  };

  // Handle map click to set marker position
  const handleMapClick = (event) => {
    setLocation({
      type: 'Point',
      coordinates: [event.lngLat.lng, event.lngLat.lat]
    });
  };

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    
    setAddingCategory(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/categories`, {
        name: newCategoryName.trim()
      });
      
      // Category API returns the created category directly
      if (response.data && response.data._id) {
        const newCategory = response.data;
        setNewCategoryName('');
        setShowAddCategory(false);
        setSuccess('Category added successfully');
        
        // Refresh categories list
        fetchCategories();
        
        // Set the new category as selected
        setFormData(prev => ({ ...prev, categoryId: newCategory._id }));
      } else {
        setError('Failed to add category: Unexpected response format');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while adding the category');
    } finally {
      setAddingCategory(false);
    }
  };

  // Select a user from the dropdown
  const handleUserSelect = (user) => {
    setFormData(prev => ({ ...prev, userId: user._id }));
    setUserDropdownOpen(false);
    setUserSearchQuery('');
  };

  // Upload images to server and get URLs
  const uploadImages = async () => {
    if (pictures.length === 0) return [];
    
    setUploadingImages(true);
    const imageUrls = [];
    
    try {
      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Add each picture to the form data
      pictures.forEach(file => {
        formData.append('images', file);
      });
      
      // Upload the images using the new upload API endpoint
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload/multiple`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success && response.data.fileUrls) {
        // Use the URLs directly from the response - they already include the base URL
        imageUrls.push(...response.data.fileUrls);
      } else {
        throw new Error('Image upload failed');
      }
      
      return imageUrls;
    } catch (err) {
      console.error('Error uploading images:', err);
      throw new Error('Failed to upload images: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingImages(false);
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }
    
    if (!formData.categoryId) {
      setError('Category is required');
      setLoading(false);
      return;
    }
    
    if (!formData.userId) {
      setError('User is required');
      setLoading(false);
      return;
    }
    
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Create project with uploaded image URLs
      const projectData = {
        ...formData,
        pictures: imageUrls,
        location: location,
        createdAt: new Date(formData.createdAt).toISOString() // Convert to ISO format for backend
      };
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/projects`, projectData);
      
      if (response.data.success) {
        setSuccess('Project created successfully');
        
        // Navigate to the new project after a brief delay
        setTimeout(() => {
          navigate(`/admin/projects/${response.data.project._id}`);
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'An error occurred while creating the project');
    } finally {
      setLoading(false);
    }
  };

  // Find user by ID
  const findUserById = (userId) => {
    return users.find(user => user._id === userId);
  };

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : ''}`}>
      <div className="mb-6">
        <Link 
          to="/admin/projects" 
          className={`flex items-center ${isDark ? 'text-gray-300 hover:text-white' : 'text-silver-200 hover:text-silver-100'} transition-colors`}
        >
          <FiArrowLeft className="mr-2" /> Back to Projects
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-sm border overflow-hidden`}
      >
        <div className="p-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-silver-100'} mb-6`}>Create New Project</h1>
          
          {error && (
            <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-md`}>
              {error}
            </div>
          )}
          
          {success && (
            <div className={`mb-6 p-4 ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'} rounded-md`}>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label htmlFor="title" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-silver-100'} mb-1`}>
                    Project Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="Enter project title"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-silver-100'} mb-1`}>
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="Enter project description"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="status" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-silver-100'} mb-1`}>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                  >
                    <option value="Demandé">Demandé</option>
                    <option value="Accepteé">Accepteé</option>
                    <option value="En cours">En cours</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-silver-100'} mb-1`}>
                    Category*
                  </label>
                  {showAddCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className={`flex-grow px-3 py-2 border rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                        placeholder="New category name"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={addingCategory}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                      >
                        {addingCategory ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className={`px-3 py-2 rounded-md ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className={`flex-grow px-3 py-2 border rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-silver-100'} mb-1`}>
                    Assign to User*
                  </label>
                  <div className="relative">
                    {formData.userId ? (
                      <div className={`flex items-center justify-between px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300 bg-white'}`}>
                        <div className="flex items-center">
                          <img
                            src={findUserById(formData.userId)?.picture || 'https://via.placeholder.com/32x32?text=User'}
                            alt="User"
                            className="h-6 w-6 rounded-full mr-2"
                          />
                          <span className={isDark ? 'text-white' : ''}>{findUserById(formData.userId)?.name}</span>
                          <span className={`ml-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{findUserById(formData.userId)?.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, userId: '' }));
                            setUserDropdownOpen(true);
                          }}
                          className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setUserDropdownOpen(true)}
                        className={`flex items-center px-3 py-2 border rounded-md cursor-pointer ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300 bg-white'}`}
                      >
                        <FiUser className={`${isDark ? 'text-gray-400' : 'text-gray-400'} mr-2`} />
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select a user</span>
                      </div>
                    )}
                    
                    {userDropdownOpen && (
                      <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className={`p-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              className={`w-full pl-9 pr-3 py-2 border rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                              placeholder="Search users..."
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredUsers.length === 0 ? (
                            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No users found</div>
                          ) : (
                            filteredUsers.map((user) => (
                              <div
                                key={user._id}
                                className={`px-4 py-2 cursor-pointer flex items-center ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                onClick={() => handleUserSelect(user)}
                              >
                                <img
                                  src={user.picture || 'https://via.placeholder.com/32x32?text=User'}
                                  alt={user.name}
                                  className="h-8 w-8 rounded-full mr-2"
                                />
                                <div>
                                  <div className={`font-medium ${isDark ? 'text-white' : ''}`}>{user.name}</div>
                                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-silver-100'} mb-1`}>
                    Project Images
                  </label>
                  <div className={`border-2 border-dashed rounded-md p-4 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative h-24 w-24">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {imagePreviewUrls.length === 0 && (
                        <div className={`w-full text-center ${isDark ? 'text-gray-400' : 'text-gray-500'} py-8`}>
                          No images selected
                        </div>
                      )}
                    </div>
                    
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <FiUpload className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Click to upload images (max 5MB each)
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-silver-100'} mb-1`}>
                    Creation Date
                  </label>
                  <input
                    type="datetime-local"
                    name="createdAt"
                    value={formData.createdAt}
                    onChange={handleChange}
                    className={`w-full rounded-md shadow-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} focus:ring-coquelicot focus:border-coquelicot`}
                  />
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select the date and time when the project was created. Defaults to current time.
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-silver-100'} mb-1`}>
                    Project Location
                  </label>
                  <div className={`h-60 rounded-md overflow-hidden border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                    <Map
                      initialViewState={{
                        longitude: viewport.longitude,
                        latitude: viewport.latitude,
                        zoom: viewport.zoom
                      }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle={isDark ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11"}
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
                  <div className={`mt-2 text-sm flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FiMapPin className="mr-1" /> Click on the map to set project location or drag the marker
                  </div>
                  <div className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Location: {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`mt-6 pt-6 border-t flex justify-end ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <Link
                to="/admin/projects"
                className={`px-4 py-2 border rounded-md mr-2 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-coquelicot hover:bg-coquelicot-600 text-white rounded-md disabled:bg-coquelicot-300 flex items-center"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Save Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddProjectPage;
