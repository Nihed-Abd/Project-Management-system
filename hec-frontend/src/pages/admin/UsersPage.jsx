import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCheck, FiX, FiEdit, FiUserX, FiUserCheck, FiCalendar, FiShield, FiMail, FiUserPlus } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
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

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const { currentUser } = useAuth();
  
  // Add client form state
  const [addingUser, setAddingUser] = useState(false);
  
  // Role options
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Banned' }
  ];

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Extract available years from users when they load
  useEffect(() => {
    if (users.length > 0) {
      const years = new Set();
      users.forEach(user => {
        if (user.creationDate) {
          const year = new Date(user.creationDate).getFullYear();
          years.add(year);
        }
      });
      // Sort years in descending order (newest first)
      setAvailableYears(Array.from(years).sort((a, b) => b - a));
    }
  }, [users]);

  // Apply filters when search query or other filters change
  useEffect(() => {
    // Apply all filters
    let filtered = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.name && user.name.toLowerCase().includes(query)) || 
        (user.email && user.email.toLowerCase().includes(query))
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      const isActive = statusFilter === 'true';
      filtered = filtered.filter(user => user.isActive === isActive);
    }
    
    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(user => {
        if (!user.creationDate) return false;
        const userYear = new Date(user.creationDate).getFullYear();
        return userYear === parseInt(yearFilter);
      });
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, statusFilter, yearFilter, users]);

  // Fetch all users from the API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        setError('Failed to fetch users: Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle year filter change
  const handleYearFilterChange = (e) => {
    setYearFilter(e.target.value);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Toggle user active status (ban/unban)
  const toggleUserStatus = async (user) => {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'ban';
    
    try {
      // Show confirmation dialog with SweetAlert2
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to ${action} user "${user.name}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStatus ? '#10B981' : '#EF4444',
        cancelButtonColor: '#64748B',
        confirmButtonText: `Yes, ${action} user!`,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: true
      });
      
      // If user confirmed, proceed with status change
      if (result.isConfirmed) {
        // Using the specific status endpoint for better API design
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/status/${user._id}`, {
          isActive: newStatus
        });
        
        if (response.data && response.data.success) {
          // Show success message
          await Swal.fire({
            title: 'Success!',
            text: `User ${action}ed successfully.`,
            icon: 'success',
            confirmButtonColor: '#10B981'
          });
          
          // Refresh users list
          fetchUsers();
        } else {
          throw new Error(response.data?.message || `Failed to ${action} user`);
        }
      }
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      
      // Show error message
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || `Failed to ${action} user`,
        icon: 'error',
        confirmButtonColor: '#3B82F6'
      });
    }
  };

  // Add new client
  const addNewClient = () => {
    Swal.fire({
      title: 'Add New Client',
      html: `
        <div class="space-y-3">
          <div class="flex flex-col">
            <label for="swal-name" class="text-left text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input id="swal-name" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coquelicot focus:border-coquelicot">
          </div>
          <div class="flex flex-col">
            <label for="swal-email" class="text-left text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="swal-email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coquelicot focus:border-coquelicot">
          </div>
          <div class="flex flex-col">
            <label for="swal-phone" class="text-left text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input id="swal-phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coquelicot focus:border-coquelicot">
          </div>
          <div class="flex flex-col">
            <label for="swal-password" class="text-left text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="swal-password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coquelicot focus:border-coquelicot">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add Client',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const email = document.getElementById('swal-email').value;
        const phoneNumber = document.getElementById('swal-phone').value;
        const password = document.getElementById('swal-password').value;
        
        // Validation
        if (!name || !email || !password) {
          Swal.showValidationMessage('Please fill in all required fields');
          return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Please enter a valid email address');
          return false;
        }
        
        return { name, email, phoneNumber, password };
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        registerNewClient(result.value);
      }
    });
  };
  
  // Register the new client
  const registerNewClient = async (userData) => {
    setAddingUser(true);
    try {
      // Add the default role as 'user'
      const dataToSend = {
        ...userData,
        role: 'user'
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        dataToSend
      );
      
      if (response.data.success) {
        Swal.fire({
          title: 'Success',
          text: 'New client has been added successfully',
          icon: 'success',
          confirmButtonText: 'Great!'
        });
        
        // Refresh the user list
        fetchUsers();
      } else {
        throw new Error(response.data.message || 'Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add client',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setAddingUser(false);
    }
  };

  // Change user role
  const changeUserRole = async (user) => {
    try {
      // Define role options - only 'user' and 'admin' as per backend model
      const roles = ['user', 'admin'];
      
      // Prepare role options for the select dropdown
      const roleOptions = roles.map(role => ({
        value: role,
        text: role === 'user' ? 'Client' : 'Admin' // Better labels for display
      }));
      
      // Show role selection dialog
      const { value: newRole } = await Swal.fire({
        title: 'Change User Role',
        text: `Current role: ${user.role === 'user' ? 'Client' : 'Admin'}`,
        input: 'select',
        inputOptions: roleOptions.reduce((obj, item) => {
          obj[item.value] = item.text;
          return obj;
        }, {}),
        inputValue: user.role,
        showCancelButton: true,
        confirmButtonText: 'Change Role',
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#64748B',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to select a role!';
          }
        }
      });
      
      if (newRole && newRole !== user.role) {
        // Confirm role change
        const confirmResult = await Swal.fire({
          title: 'Confirm Role Change',
          text: `Change role from "${user.role === 'user' ? 'Client' : 'Admin'}" to "${newRole === 'user' ? 'Client' : 'Admin'}"?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3B82F6',
          cancelButtonColor: '#64748B',
          confirmButtonText: 'Yes, change it!',
          cancelButtonText: 'Cancel',
          reverseButtons: true,
          focusCancel: true
        });
        
        if (confirmResult.isConfirmed) {
          // Using the specific role endpoint for better API design
          const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/role/${user._id}`, {
            role: newRole
          });
          
          if (response.data && response.data.success) {
            // Show success message
            await Swal.fire({
              title: 'Success!',
              text: `User role changed to ${newRole === 'user' ? 'Client' : 'Admin'} successfully.`,
              icon: 'success',
              confirmButtonColor: '#10B981'
            });
            
            // Refresh users list
            fetchUsers();
          } else {
            throw new Error(response.data?.message || 'Failed to change user role');
          }
        }
      }
    } catch (err) {
      console.error('Error changing user role:', err);
      
      // Show error message
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to change user role',
        icon: 'error',
        confirmButtonColor: '#3B82F6'
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        {/* Add New Client Button */}
        <button
          onClick={addNewClient}
          className="flex items-center px-4 py-2 bg-coquelicot hover:bg-coquelicot-600 text-white rounded-md transition-colors"
          disabled={addingUser}
        >
          {addingUser ? (
            <>
              <span className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
              Adding...
            </>
          ) : (
            <>
              <FiUserPlus className="mr-2" />
              Add New Client
            </>
          )}
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-coquelicot-500 focus:border-coquelicot-500"
          />
        </div>
        
        <div className="flex space-x-2">
          {/* Role filter */}
          <div className="relative">
            <select
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={roleFilter}
              onChange={handleRoleFilterChange}
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiShield />
            </div>
          </div>
          
          {/* Status filter */}
          <div className="relative">
            <select
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiFilter />
            </div>
          </div>
          
          {/* Year filter */}
          <div className="relative">
            <select
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={yearFilter}
              onChange={handleYearFilterChange}
            >
              <option value="">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiCalendar />
            </div>
          </div>
        </div>
      </div>

      {/* Display error if any */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coquelicot-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No users found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
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
                {filteredUsers.map((user, index) => (
                  <motion.tr 
                    key={user._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiMail className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role === 'user' ? 'Client' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <FiCalendar className="text-gray-400" />
                        {formatDate(user.creationDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Role change button */}
                        <button 
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeUserRole(user);
                          }}
                          title="Change role"
                        >
                          <FiShield className="text-xl" />
                        </button>
                        
                        {/* Ban/Unban button */}
                        <button 
                          className={`p-2 rounded-full transition-colors ${
                            user.isActive 
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUserStatus(user);
                          }}
                          title={user.isActive ? 'Ban user' : 'Activate user'}
                        >
                          {user.isActive ? <FiUserX className="text-xl" /> : <FiUserCheck className="text-xl" />}
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

export default UsersPage;
