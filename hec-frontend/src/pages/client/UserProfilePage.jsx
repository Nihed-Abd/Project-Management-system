import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEdit, FiSave, FiX, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const UserProfilePage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    picture: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  
  // Initialize form with user data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        picture: currentUser.picture || ''
      });
      
      if (currentUser.picture) {
        setImagePreview(currentUser.picture);
      }
    }
  }, [currentUser]);
  
  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setErrors({
          ...errors,
          picture: 'Please select an image file (jpg, png, etc.)'
        });
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          picture: 'Image size should not exceed 2MB'
        });
        return;
      }
      
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error if any
      if (errors.picture) {
        setErrors({
          ...errors,
          picture: ''
        });
      }
    }
  };
  
  // Upload profile image
  const uploadProfileImage = async () => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/upload/single`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data && response.data.fileUrl) {
        return response.data.fileUrl;
      }
      return null;
    } catch (err) {
      console.error('Error uploading profile image:', err);
      throw new Error('Failed to upload profile image');
    }
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (profileData.phoneNumber && !/^\+?[0-9]{8,15}$/.test(profileData.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateProfileForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload image if changed
      let pictureUrl = profileData.picture;
      if (imageFile) {
        pictureUrl = await uploadProfileImage();
        if (!pictureUrl) {
          throw new Error('Failed to upload profile image');
        }
      }
      
      // Update profile data
      const updatedProfile = {
        ...profileData,
        picture: pictureUrl
      };
      
      const response = await axios.put(
        `http://localhost:5000/api/users/${currentUser._id}`,
        updatedProfile
      );
      
      if (response.data && response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated',
          text: 'Your profile has been updated successfully',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Reload the page to get fresh data from server
          window.location.reload();
        });
        
        // Exit edit mode
        setEditMode(false);
      } else {
        throw new Error(response.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Using the update user endpoint with password change
      // Use a hardcoded URL for now to ensure connection
      const response = await axios.put(
        `http://localhost:5000/api/users/${currentUser._id}`,
        {
          password: passwordData.newPassword,
          currentPassword: passwordData.currentPassword
        }
      );
      
      if (response.data && response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Password Changed',
          text: 'Your password has been changed successfully',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Reload the page to get fresh data from server
          window.location.reload();
        });
        
        // Reset form and exit password mode
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        setPasswordMode(false);
      } else {
        throw new Error(response.data?.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      Swal.fire({
        icon: 'error',
        title: 'Password Change Failed',
        text: err.response?.data?.message || 'Failed to change password. Please verify your current password.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel profile edit
  const handleCancelEdit = () => {
    // Reset form to current user data
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        picture: currentUser.picture || ''
      });
      
      if (currentUser.picture) {
        setImagePreview(currentUser.picture);
      } else {
        setImagePreview('');
      }
    }
    
    // Clear image file
    setImageFile(null);
    
    // Clear errors
    setErrors({});
    
    // Exit edit mode
    setEditMode(false);
  };
  
  // Cancel password change
  const handleCancelPasswordChange = () => {
    // Reset password form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    
    // Clear errors
    setErrors({});
    
    // Exit password mode
    setPasswordMode(false);
  };
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };
  
  const formVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
          <button
            onClick={() => window.location.href = '/login'}
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
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-coquelicot-50 to-coquelicot-100 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {imagePreview || profileData.picture ? (
                    <img 
                      src={imagePreview || profileData.picture} 
                      alt={profileData.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-coquelicot text-white text-4xl font-bold">
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                
                {editMode && (
                  <div className="absolute bottom-0 right-0">
                    <label className="flex items-center justify-center h-8 w-8 rounded-full bg-coquelicot text-white shadow cursor-pointer hover:bg-coquelicot-600 transition-colors">
                      <FiEdit className="h-4 w-4" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <div className="text-center md:text-left flex-grow">
                <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                <p className="text-gray-600">{currentUser.email}</p>
                {currentUser.phoneNumber && (
                  <p className="text-gray-600">{currentUser.phoneNumber}</p>
                )}
                
                {!editMode && !passwordMode && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setPasswordMode(true)}
                      className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                      <FiLock className="mr-2 h-4 w-4" />
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Edit Form */}
            {editMode && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={formVariants}
                className="p-6"
              >
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot`}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleProfileChange}
                          className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                      )}
                    </div>
                    
                    {errors.picture && (
                      <p className="text-sm text-red-600">{errors.picture}</p>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot"
                        disabled={loading}
                      >
                        <FiX className="mr-2 h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-coquelicot hover:bg-coquelicot-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Saving...
                          </span>
                        ) : (
                          <>
                            <FiSave className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Password Change Form */}
            {passwordMode && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={formVariants}
                className="p-6"
              >
                <form onSubmit={handlePasswordReset}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot`}
                          placeholder="Enter your current password"
                        />
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot`}
                          placeholder="Enter your new password"
                        />
                      </div>
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiCheckCircle className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="confirmNewPassword"
                          name="confirmNewPassword"
                          value={passwordData.confirmNewPassword}
                          onChange={handlePasswordChange}
                          className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot`}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      {errors.confirmNewPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancelPasswordChange}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot"
                        disabled={loading}
                      >
                        <FiX className="mr-2 h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-coquelicot hover:bg-coquelicot-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Updating...
                          </span>
                        ) : (
                          <>
                            <FiSave className="mr-2 h-4 w-4" />
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* User Account Details */}
            {!editMode && !passwordMode && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-base font-medium text-gray-800">{currentUser.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-800">{currentUser.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-base font-medium text-gray-800">
                      {currentUser.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="text-base font-medium text-gray-800 capitalize">
                      {currentUser.role || 'User'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;
