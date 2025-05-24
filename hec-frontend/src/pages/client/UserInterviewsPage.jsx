import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCalendar, FiClock, FiMapPin, FiVideo, FiUsers } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const UserInterviewsPage = () => {
  const { currentUser } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Fetch user interviews on component mount
  useEffect(() => {
    if (currentUser) {
      fetchUserInterviews();
    }
  }, [currentUser]);

  // Filter interviews when search query or status filter changes
  useEffect(() => {
    filterInterviews();
  }, [searchQuery, statusFilter, interviews]);

  const fetchUserInterviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/interviews/user/${currentUser._id}`);
      
      // Handle different API response formats
      if (response.data && Array.isArray(response.data)) {
        setInterviews(response.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.interviews)) {
        setInterviews(response.data.interviews);
      } else {
        setError('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error fetching user interviews:', err);
      setError('Failed to load your interviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(interview => 
        (interview.title && interview.title.toLowerCase().includes(query)) || 
        (interview.description && interview.description.toLowerCase().includes(query)) ||
        (interview.location && interview.location.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }
    
    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
    
    setFilteredInterviews(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Join interview meeting
  const joinMeeting = (meetingUrl) => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank');
    } else {
      Swal.fire({
        title: 'No Meeting Link',
        text: 'No meeting link is available for this interview.',
        icon: 'info',
        confirmButtonColor: '#fe3201'
      });
    }
  };

  // Confirm interview attendance
  const confirmAttendance = async (interviewId) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/interviews/confirm/${interviewId}`, {
        userId: currentUser._id
      });
      
      if (response.data && response.data.success) {
        Swal.fire({
          title: 'Confirmed!',
          text: 'Your attendance has been confirmed.',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        
        // Refresh the interviews list
        fetchUserInterviews();
      } else {
        throw new Error('Failed to confirm attendance');
      }
    } catch (err) {
      console.error('Error confirming attendance:', err);
      
      Swal.fire({
        title: 'Error!',
        text: 'Failed to confirm your attendance. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
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
    if (!dateString) return 'Not scheduled';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Check if an interview is upcoming (within next 24 hours)
  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    const interviewDate = new Date(dateString);
    const now = new Date();
    const hoursDiff = (interviewDate - now) / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  const renderContent = () => {
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
            onClick={fetchUserInterviews}
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
          <p className="text-gray-600 mb-4">Please log in to view your interviews.</p>
          <a href="/login" className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors">
            Log In
          </a>
        </div>
      );
    }

    if (filteredInterviews.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-2">No interviews found matching your criteria.</p>
          {interviews.length > 0 ? (
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
              <p className="text-gray-600 mb-4">You don't have any scheduled interviews yet.</p>
              <a href="/contact" className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors">
                Contact Us
              </a>
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
        {filteredInterviews.map((interview) => (
          <motion.div
            key={interview._id}
            variants={itemVariants}
            className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all border ${
              isUpcoming(interview.scheduledDate) ? 'border-coquelicot' : 'border-gray-100'
            }`}
          >
            <div className="p-6">
              {isUpcoming(interview.scheduledDate) && (
                <div className="mb-4 py-2 px-4 bg-coquelicot bg-opacity-10 rounded-md border border-coquelicot border-opacity-20">
                  <p className="text-coquelicot font-medium text-sm">Upcoming interview in less than 24 hours!</p>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{interview.title || 'Project Interview'}</h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                  interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {interview.status === 'completed' ? 'Completed' :
                   interview.status === 'scheduled' ? 'Scheduled' :
                   'Cancelled'}
                </span>
              </div>
              
              {interview.description && (
                <div className="mb-4">
                  <p className="text-gray-600">{interview.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start">
                  <FiCalendar className="mt-1 mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date</p>
                    <p className="text-gray-600">{formatDate(interview.scheduledDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiClock className="mt-1 mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Time</p>
                    <p className="text-gray-600">{formatTime(interview.scheduledDate)}</p>
                  </div>
                </div>
                
                {interview.location && (
                  <div className="flex items-start">
                    <FiMapPin className="mt-1 mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-600">{interview.location}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <FiUsers className="mt-1 mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Participants</p>
                    <p className="text-gray-600">{interview.participants ? interview.participants.length : 1} participant(s)</p>
                  </div>
                </div>
              </div>
              
              {interview.status === 'scheduled' && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  {interview.meetingUrl && (
                    <button
                      onClick={() => joinMeeting(interview.meetingUrl)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors"
                    >
                      <FiVideo className="mr-2" />
                      Join Meeting
                    </button>
                  )}
                  
                  {!interview.confirmed && (
                    <button
                      onClick={() => confirmAttendance(interview._id)}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-coquelicot text-coquelicot bg-white rounded-md hover:bg-coquelicot-50 transition-colors"
                    >
                      Confirm Attendance
                    </button>
                  )}
                </div>
              )}
              
              {interview.confirmed && (
                <p className="mt-4 text-sm text-green-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  You have confirmed your attendance
                </p>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Interviews</h1>
          <p className="text-gray-600">
            View and manage your scheduled interviews with HEC Tunisia.
          </p>
        </motion.div>

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
                  placeholder="Search interviews..."
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

        {/* Interviews List */}
        <div className="mt-8">
          {renderContent()}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 bg-gray-50 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Need to reschedule?</h2>
          <p className="text-gray-600 mb-6">
            If you need to reschedule an interview or have any questions about your upcoming meetings, 
            please contact our team using the form on our contact page or call us directly.
          </p>
          <a 
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-coquelicot text-white rounded-md shadow-md hover:bg-coquelicot-600 transition-colors"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default UserInterviewsPage;
