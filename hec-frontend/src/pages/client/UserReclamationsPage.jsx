import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCalendar, FiMessageSquare, FiPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const UserReclamationsPage = () => {
  const { currentUser } = useAuth();
  const [reclamations, setReclamations] = useState([]);
  const [filteredReclamations, setFilteredReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // New reclamation form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    object: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'Answered', label: 'Answered' }
  ];

  // Define fetchUserReclamations with useCallback
  const fetchUserReclamations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reclamations/user/${currentUser?._id}`);
      
      // Handle different API response formats
      if (response.data && Array.isArray(response.data)) {
        setReclamations(response.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.reclamations)) {
        setReclamations(response.data.reclamations);
      } else {
        setError('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error fetching user reclamations:', err);
      setError('Failed to load your reclamations. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Define filterReclamations with useCallback
  const filterReclamations = useCallback(() => {
    let filtered = [...reclamations];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reclamation => 
        reclamation.object.toLowerCase().includes(query) || 
        reclamation.message.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(reclamation => reclamation.statusRec === statusFilter);
    }
    
    setFilteredReclamations(filtered);
  }, [reclamations, searchQuery, statusFilter]);

  // Fetch user reclamations on component mount
  useEffect(() => {
    if (currentUser) {
      fetchUserReclamations();
    }
  }, [currentUser, fetchUserReclamations]);

  // Filter reclamations when search query or status filter changes
  useEffect(() => {
    filterReclamations();
  }, [filterReclamations]);

  // fetchUserReclamations is now defined above with useCallback

  // filterReclamations is now defined above with useCallback

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.object || !formData.message) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all fields',
        icon: 'error',
        confirmButtonColor: '#fe3201'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reclamations`, {
        userId: currentUser._id,
        object: formData.object,
        message: formData.message
      });

      // If we get a response with data, consider it successful
      // The API appears to return successfully but may not have the exact structure we expect
      if (response.data) {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'Your reclamation has been submitted successfully',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });

        // Reset form and close it
        setFormData({
          object: '',
          message: ''
        });
        setShowForm(false);

        // Refresh reclamations list
        fetchUserReclamations();
      } else {
        throw new Error('Failed to submit reclamation');
      }
    } catch (err) {
      console.error('Error submitting reclamation:', err);
      
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit your reclamation. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not answered yet';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderReclamationsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coquelicot"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUserReclamations}
            className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Please log in to view your reclamations.</p>
          <a href="/login" className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors">
            Log In
          </a>
        </div>
      );
    }

    if (filteredReclamations.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-2">No reclamations found matching your criteria.</p>
          {reclamations.length > 0 ? (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="text-coquelicot hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-gray-600 mb-4">You haven't submitted any reclamations yet.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
              >
                Submit a Reclamation
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {filteredReclamations.map((reclamation) => (
          <motion.div
            key={reclamation._id}
            variants={itemVariants}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{reclamation.object}</h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  reclamation.statusRec === 'Answered' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {reclamation.statusRec === 'Answered' ? (
                    <><FiCheckCircle className="mr-1" /> Answered</>
                  ) : (
                    <><FiAlertCircle className="mr-1" /> Pending</>
                  )}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 whitespace-pre-line">{reclamation.message}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center mb-2 sm:mb-0">
                  <FiCalendar className="mr-2 h-4 w-4" />
                  <span>Submitted: {formatDate(reclamation.dateCreation)}</span>
                </div>
                
                {reclamation.statusRec === 'Answered' && (
                  <div className="flex items-center text-green-600">
                    <FiMessageSquare className="mr-2 h-4 w-4" />
                    <span>Answered: {formatDate(reclamation.dateAnswer)}</span>
                  </div>
                )}
              </div>
              
              {reclamation.answer && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-800 mb-2">Response:</h4>
                  <p className="text-gray-600 whitespace-pre-line">{reclamation.answer}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Reclamations</h1>
              <p className="text-gray-600">
                View and manage your reclamations with HEC Tunisia.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
              >
                <FiPlus className="mr-2" />
                New Reclamation
              </button>
            </div>
          </div>
        </motion.div>

        {/* New Reclamation Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Submit a New Reclamation</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="object" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="object"
                    name="object"
                    value={formData.object}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot-500"
                    placeholder="Enter the subject of your reclamation"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot-500 resize-none"
                    placeholder="Describe your issue in detail"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors disabled:bg-coquelicot-300"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : 'Submit Reclamation'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex-grow">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reclamations..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coquelicot-500"
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coquelicot-500 appearance-none bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reclamations List */}
        <div className="mt-8">
          {renderReclamationsList()}
        </div>
      </div>
    </div>
  );
};

export default UserReclamationsPage;
