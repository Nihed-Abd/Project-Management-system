import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiUpload, FiX, FiMapPin, FiUser, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map, Marker } from 'react-map-gl';

const EditProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

  // Project form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Demandé',
    categoryId: '',
    userId: '',
  });
  
  // Original project data for comparison
  const [originalProject, setOriginalProject] = useState(null);
  
  // Image upload states
  const [pictures, setPictures] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
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
  const [fetchingProject, setFetchingProject] = useState(true);
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
  
  // Fetch project, categories and users on component mount
  useEffect(() => {
    fetchProject();
    fetchCategories();
    fetchUsers();
  }, [projectId]);
  
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

  // Fetch project data
  const fetchProject = async () => {
    setFetchingProject(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`);
      if (response.data.success) {
        const project = response.data.project;
        setOriginalProject(project);
        
        // Set form data
        setFormData({
          title: project.title,
          description: project.description,
          status: project.status,
          categoryId: project.categoryId?._id || project.categoryId,
          userId: project.userId?._id || project.userId,
        });
        
        // Set existing images
        if (project.pictures && project.pictures.length > 0) {
          setExistingImages(project.pictures);
        }
        
        // Set location if available
        if (project.location && project.location.coordinates) {
          setLocation(project.location);
          setViewport({
            latitude: project.location.coordinates[1],
            longitude: project.location.coordinates[0],
            zoom: 13
          });
        }
      } else {
        setError('Failed to fetch project');
        navigate('/admin/projects');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching the project');
      navigate('/admin/projects');
    } finally {
      setFetchingProject(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        console.error('Failed to fetch categories:', response.data.message);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } else {
        console.error('Failed to fetch users:', response.data.message);
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

  // Remove a newly added image
  const removeNewImage = (index) => {
    const newPictures = [...pictures];
    const newPreviewUrls = [...imagePreviewUrls];
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newPictures.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setPictures(newPictures);
    setImagePreviewUrls(newPreviewUrls);
  };

  // Remove an existing image
  const removeExistingImage = (index) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
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
      
      if (response.data.success) {
        setNewCategoryName('');
        setShowAddCategory(false);
        setSuccess('Category added successfully');
        
        // Refresh categories list
        fetchCategories();
        
        // Set the new category as selected
        setFormData(prev => ({ ...prev, categoryId: response.data.category._id }));
      } else {
        setError(response.data.message || 'Failed to add category');
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

  // Upload new images to server and get URLs
  const uploadImages = async () => {
    if (pictures.length === 0) return [];
    
    setUploadingImages(true);
    const imageUrls = [];
    
    try {
      // In a real implementation, you would upload to your server or a cloud storage service
      // For now, we'll simulate the upload and return the local preview URLs
      // This should be replaced with actual image upload logic
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just use the preview URLs
      // In a real app, you would upload each file and get the remote URL
      imageUrls.push(...imagePreviewUrls);
      
      return imageUrls;
    } catch (err) {
      console.error('Error uploading images:', err);
      throw new Error('Failed to upload images');
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
    
    try {
      // Upload new images first
      const newImageUrls = await uploadImages();
      
      // Combine existing and new image URLs
      const allImages = [...existingImages, ...newImageUrls];
      
      // Create project update data
      const projectData = {
        ...formData,
        pictures: allImages,
        location: location
      };
      
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`, projectData);
      
      if (response.data.success) {
        setSuccess('Project updated successfully');
        
        // Navigate to the project details after a brief delay
        setTimeout(() => {
          navigate(`/admin/projects/${projectId}`);
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'An error occurred while updating the project');
    } finally {
      setLoading(false);
    }
  };

  // Find user by ID
  const findUserById = (userId) => {
    return users.find(user => user._id === userId);
  };

  // If still fetching project, show loading state
  if (fetchingProject) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coquelicot"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          to={`/admin/projects/${projectId}`} 
          className="flex items-center text-silver-200 hover:text-silver-100 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Project Details
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-silver-100 mb-6">Edit Project</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-md">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-silver-100 mb-1">
                    Project Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500"
                    placeholder="Enter project title"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-silver-100 mb-1">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500"
                    placeholder="Enter project description"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-silver-100 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500"
                  >
                    <option value="Demandé">Demandé</option>
                    <option value="Accepteé">Accepteé</option>
                    <option value="En cours">En cours</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-silver-100 mb-1">
                    Category*
                  </label>
                  {showAddCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500"
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
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500"
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
                  <label className="block text-sm font-medium text-silver-100 mb-1">
                    Assigned User
                  </label>
                  <div className="relative">
                    {formData.userId ? (
                      <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md">
                        <div className="flex items-center">
                          <img
                            src={findUserById(formData.userId)?.picture || 'https://via.placeholder.com/32x32?text=User'}
                            alt="User"
                            className="h-6 w-6 rounded-full mr-2"
                          />
                          <span>{findUserById(formData.userId)?.name}</span>
                          <span className="ml-2 text-gray-500 text-xs">{findUserById(formData.userId)?.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setUserDropdownOpen(true)}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
                      >
                        <FiUser className="text-gray-400 mr-2" />
                        <span className="text-gray-500">Select a user</span>
                      </div>
                    )}
                    
                    {userDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                        <div className="p-2 border-b">
                          <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500"
                              placeholder="Search users..."
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No users found</div>
                          ) : (
                            filteredUsers.map((user) => (
                              <div
                                key={user._id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                onClick={() => handleUserSelect(user)}
                              >
                                <img
                                  src={user.picture || 'https://via.placeholder.com/32x32?text=User'}
                                  alt={user.name}
                                  className="h-8 w-8 rounded-full mr-2"
                                />
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
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
                  <label className="block text-sm font-medium text-silver-100 mb-1">
                    Project Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                    <div className="flex flex-wrap gap-3 mb-4">
                      {/* Existing images */}
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative h-24 w-24">
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="h-full w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {/* New images */}
                      {imagePreviewUrls.map((url, index) => (
                        <div key={`new-${index}`} className="relative h-24 w-24">
                          <img
                            src={url}
                            alt={`New ${index + 1}`}
                            className="h-full w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {existingImages.length === 0 && imagePreviewUrls.length === 0 && (
                        <div className="w-full text-center text-gray-500 py-8">
                          No images selected
                        </div>
                      )}
                    </div>
                    
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <FiUpload className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          Click to upload new images (max 5MB each)
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
                  <label className="block text-sm font-medium text-silver-100 mb-1">
                    Project Location
                  </label>
                  <div className="h-60 rounded-md overflow-hidden border border-gray-300">
                    <Map
                      initialViewState={{
                        longitude: viewport.longitude,
                        latitude: viewport.latitude,
                        zoom: viewport.zoom
                      }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle="mapbox://styles/mapbox/streets-v11"
                      mapboxAccessToken={mapboxToken}
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
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <FiMapPin className="mr-1" /> Click on the map to set project location or drag the marker
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Location: {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-red-50 rounded-md">
                  <h3 className="text-sm font-medium text-red-600 flex items-center">
                    <FiTrash2 className="mr-1" /> Danger Zone
                  </h3>
                  <p className="text-xs text-red-500 mt-1">
                    Deleting a project will remove all associated data and cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                        // Delete logic would go here
                        axios.delete(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`)
                          .then(response => {
                            if (response.data.success) {
                              navigate('/admin/projects');
                            } else {
                              setError(response.data.message || 'Failed to delete project');
                            }
                          })
                          .catch(err => {
                            setError(err.response?.data?.message || 'An error occurred while deleting the project');
                          });
                      }
                    }}
                    className="mt-2 px-3 py-1 bg-white border border-red-300 text-red-600 text-sm rounded hover:bg-red-50"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <Link
                to={`/admin/projects/${projectId}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
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
                    <FiSave className="mr-2" /> Update Project
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

export default EditProjectPage;
