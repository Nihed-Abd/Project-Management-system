import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { FiPlus, FiCalendar, FiClock, FiMapPin, FiInfo, FiCheckCircle, FiXCircle, FiAlertCircle, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { format as formatDate, isToday, isTomorrow, addDays, isAfter, isBefore, parseISO } from 'date-fns';

const UserInterviewsPage = () => {
  const { currentUser } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for interview form
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    interviewGoal: '',
    date: new Date(),
    note: ''
  });
  
  // State for editing interview
  const [editMode, setEditMode] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  
  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#F59E0B', icon: FiAlertCircle },
    { value: 'accepted', label: 'Accepted', color: '#10B981', icon: FiCheckCircle },
    { value: 'declined', label: 'Declined', color: '#EF4444', icon: FiXCircle }
  ];
  
  // Set up calendar localizer
  const locales = {
    'en-US': enUS,
  };
  
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });
  
  // Fetch user interviews on component mount
  useEffect(() => {
    if (currentUser) {
      fetchUserInterviews();
    }
  }, [currentUser]);
  
  // Format interviews for calendar
  const calendarEvents = useMemo(() => {
    return interviews.map(interview => ({
      id: interview._id,
      title: interview.interviewGoal,
      start: new Date(interview.date),
      end: new Date(new Date(interview.date).getTime() + 60 * 60 * 1000), // 1 hour duration
      statusInterview: interview.statusInterview,
      note: interview.note,
      allDay: false,
      resource: interview
    }));
  }, [interviews]);
  
  const fetchUserInterviews = async () => {
    setLoading(true);
    try {
      // Use hardcoded URL for consistency
      const response = await axios.get(`http://localhost:5000/api/interviews/user/${currentUser._id}`);
      
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
  
  // Handle opening the form when a date is selected on the calendar
  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setFormData({
      ...formData,
      date: start
    });
    setShowForm(true);
    setEditMode(false);
    setSelectedInterview(null);
  };
  
  // Handle clicking on an existing event
  const handleSelectEvent = (event) => {
    setSelectedInterview(event.resource);
    setFormData({
      interviewGoal: event.title,
      date: event.start,
      note: event.note || ''
    });
    setEditMode(true);
    setShowForm(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle date change in form
  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    const [year, month, day] = dateValue.split('-').map(Number);
    const timeValue = formData.date;
    
    const newDate = new Date(timeValue);
    newDate.setFullYear(year, month - 1, day);
    
    setFormData({
      ...formData,
      date: newDate
    });
  };
  
  // Handle time change in form
  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    const [hours, minutes] = timeValue.split(':').map(Number);
    
    const newDate = new Date(formData.date);
    newDate.setHours(hours, minutes, 0);
    
    setFormData({
      ...formData,
      date: newDate
    });
  };
  
  // Submit form to create/update interview
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.interviewGoal.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter an interview goal',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
      return;
    }
    
    const interviewData = {
      userId: currentUser._id,
      interviewGoal: formData.interviewGoal,
      date: formData.date,
      note: formData.note,
      statusInterview: editMode ? selectedInterview.statusInterview : 'pending'
    };
    
    try {
      let response;
      
      if (editMode && selectedInterview) {
        // Update existing interview
        response = await axios.put(
          `http://localhost:5000/api/interviews/${selectedInterview._id}`,
          interviewData
        );
        
        Swal.fire({
          title: 'Updated!',
          text: 'Your interview has been updated successfully',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
      } else {
        // Create new interview
        response = await axios.post(
          'http://localhost:5000/api/interviews',
          interviewData
        );
        
        Swal.fire({
          title: 'Scheduled!',
          text: 'Your interview has been scheduled successfully',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
      }
      
      // Reset form and fetch updated interviews
      setFormData({
        interviewGoal: '',
        date: new Date(),
        note: ''
      });
      setShowForm(false);
      fetchUserInterviews();
    } catch (err) {
      console.error('Error saving interview:', err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save your interview. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };
  
  // Handle interview status change
  const changeInterviewStatus = async (interviewId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/interviews/${interviewId}`,
        { statusInterview: newStatus }
      );
      
      if (response.data) {
        const statusText = {
          'accepted': 'accepted',
          'declined': 'declined',
          'pending': 'set to pending'
        }[newStatus];
        
        Swal.fire({
          title: 'Status Updated',
          text: `Interview has been ${statusText} successfully`,
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        
        fetchUserInterviews();
      }
    } catch (err) {
      console.error('Error updating interview status:', err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update interview status. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };
  
  // Delete an interview
  const deleteInterview = async (interviewId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the interview',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/interviews/${interviewId}`);
          
          Swal.fire({
            title: 'Deleted!',
            text: 'Your interview has been deleted',
            icon: 'success',
            confirmButtonColor: '#10B981'
          });
          
          fetchUserInterviews();
          setShowForm(false);
        } catch (err) {
          console.error('Error deleting interview:', err);
          Swal.fire({
            title: 'Error',
            text: 'Failed to delete interview. Please try again.',
            icon: 'error',
            confirmButtonColor: '#EF4444'
          });
        }
      }
    });
  };
  
  // Custom event styling for the calendar
  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#FE3201', // Default color (coquelicot)
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    
    if (event.statusInterview === 'accepted') {
      style.backgroundColor = '#10B981'; // Green for accepted
    } else if (event.statusInterview === 'declined') {
      style.backgroundColor = '#EF4444'; // Red for declined
    } else if (event.statusInterview === 'pending') {
      style.backgroundColor = '#F59E0B'; // Amber for pending
    }
    
    return {
      style
    };
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
  
  // Format date helper functions
  const formatDateString = (date) => {
    return formatDate(date, 'yyyy-MM-dd');
  };
  
  const formatTimeString = (date) => {
    return formatDate(date, 'HH:mm');
  };
  
  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  // If user is not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-gray-600 mb-4">Please log in to view your interviews.</p>
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
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Interviews</h1>
            <button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setSelectedInterview(null);
                setFormData({
                  interviewGoal: '',
                  date: new Date(),
                  note: ''
                });
              }}
              className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-colors flex items-center"
            >
              <FiPlus className="mr-2" /> Schedule Interview
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Calendar View */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coquelicot"></div>
              </div>
            ) : (
              <div className="p-4">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  tooltipAccessor={(event) => `${event.title} - ${event.statusInterview}`}
                />
              </div>
            )}
          </div>
          
          {/* Interview Legend */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Status Legend</h3>
            <div className="flex flex-wrap gap-4">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span>{status.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Interviews */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Interviews</h3>
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-coquelicot"></div>
              </div>
            ) : interviews.length === 0 ? (
              <p className="text-gray-500 italic">No upcoming interviews scheduled.</p>
            ) : (
              <div className="space-y-4">
                {interviews
                  .filter(interview => new Date(interview.date) > new Date())
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map(interview => {
                    const interviewDate = new Date(interview.date);
                    const statusInfo = getStatusInfo(interview.statusInterview);
                    
                    return (
                      <motion.div 
                        key={interview._id} 
                        variants={itemVariants}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <h4 className="text-md font-semibold text-gray-800">{interview.interviewGoal}</h4>
                              <span 
                                className="ml-2 px-2 py-1 text-xs rounded-full" 
                                style={{ backgroundColor: statusInfo.color, color: 'white' }}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center text-gray-600 text-sm">
                              <FiCalendar className="mr-1" />
                              <span className="mr-3">
                                {isToday(interviewDate) ? 'Today' : 
                                 isTomorrow(interviewDate) ? 'Tomorrow' : 
                                 formatDate(interviewDate, 'EEE, MMM d, yyyy')}
                              </span>
                              <FiClock className="mr-1" />
                              <span>{formatDate(interviewDate, 'h:mm a')}</span>
                            </div>
                            {interview.note && (
                              <p className="mt-2 text-gray-600 text-sm">{interview.note}</p>
                            )}
                          </div>
                          <div className="flex items-center mt-3 md:mt-0 space-x-2">
                            <button 
                              onClick={() => handleSelectEvent({
                                resource: interview,
                                title: interview.interviewGoal,
                                start: new Date(interview.date),
                                note: interview.note
                              })}
                              className="p-2 text-gray-600 hover:text-coquelicot hover:bg-coquelicot-50 rounded-full transition-colors"
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button 
                              onClick={() => deleteInterview(interview._id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Interview Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Interview' : 'Schedule New Interview'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="interviewGoal" className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Purpose/Goal*
                  </label>
                  <input
                    type="text"
                    id="interviewGoal"
                    name="interviewGoal"
                    value={formData.interviewGoal}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot"
                    placeholder="e.g., Project Discussion, Initial Consultation"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formatDateString(formData.date)}
                      onChange={handleDateChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                      Time*
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formatTimeString(formData.date)}
                      onChange={handleTimeChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="3"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot"
                    placeholder="Any additional details or topics to discuss"
                  ></textarea>
                </div>
                
                {editMode && selectedInterview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex space-x-2">
                      {statusOptions.map(status => (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => changeInterviewStatus(selectedInterview._id, status.value)}
                          className={`px-3 py-1 text-sm rounded-md flex items-center ${selectedInterview.statusInterview === status.value ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          <status.icon className="mr-1" />
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-coquelicot hover:bg-coquelicot-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot"
                  >
                    {editMode ? 'Update Interview' : 'Schedule Interview'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserInterviewsPage;
