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
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { format as formatDate, isToday, isTomorrow, addDays, isAfter, isBefore, parseISO } from 'date-fns';
// No need for styled-components, we'll use regular CSS classes
import './UserInterviewsPage.css';

const UserInterviewsPage = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation(['common', 'interviews']);
  
  // We'll apply dark mode classes directly instead of using GlobalStyles variable
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
    { value: 'pending', label: t('status.pending', { ns: 'interviews' }), color: '#F59E0B', icon: FiAlertCircle },
    { value: 'accepted', label: t('status.accepted', { ns: 'interviews' }), color: '#10B981', icon: FiCheckCircle },
    { value: 'declined', label: t('status.declined', { ns: 'interviews' }), color: '#EF4444', icon: FiXCircle }
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
        setError(t('interviews.errors.unexpectedResponse'));
      }
    } catch (err) {
      console.error('Error fetching user interviews:', err);
      setError(t('interviews.errors.failedToLoad'));
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
  
  // Status can only be changed by admin
  // The changeInterviewStatus function has been removed as regular users shouldn't change interview status
  
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
            title: t('common.error'),
            text: t('interviews.errors.failedToDelete'),
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
      <div className={`min-h-screen pt-24 pb-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('pleaseLogIn', { ns: 'interviews' })}</p>
            <motion.button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-all duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('navigation.login')}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen pt-24 pb-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('myInterviews', { ns: 'interviews' })}</h1>
            <motion.button
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
              className="px-4 py-2 bg-coquelicot text-white rounded-md hover:bg-coquelicot-600 transition-all duration-300 shadow-md flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="mr-2" /> 
              <span className="ml-2">{t('scheduleInterview', { ns: 'interviews' })}</span>
            </motion.button>
          </div>
          
          {error && (
            <div className={`p-4 mb-6 border-l-4 border-red-500 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Calendar View */}
          <div className={`rounded-lg shadow-md overflow-hidden mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <motion.div 
                  className="rounded-full h-12 w-12 border-t-2 border-b-2 border-coquelicot"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
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
                  className={isDark ? 'rbc-calendar-dark' : ''}
                />
              </div>
            )}
          </div>
          
          {/* Interview Legend */}
          <div className={`rounded-lg shadow-md p-4 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Status Legend</h3>
            <div className="flex flex-wrap gap-4">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{status.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Interviews */}
          <div className={`rounded-lg shadow-md p-6 mb-8 ${isDark ? 'bg-gray-800 shadow-gray-700/20' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Upcoming Interviews</h3>
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <motion.div 
                  className="rounded-full h-8 w-8 border-t-2 border-b-2 border-coquelicot"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : interviews.length === 0 ? (
              <p className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming interviews scheduled.</p>
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
                        className={`rounded-lg p-4 transition-all duration-300 ${isDark ? 'border border-gray-700 hover:shadow-lg hover:shadow-gray-700/20 hover:border-gray-600' : 'border hover:shadow-md'}`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <h4 className={`text-md font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{interview.interviewGoal}</h4>
                              <span 
                                className="ml-2 px-2 py-1 text-xs rounded-full" 
                                style={{ backgroundColor: statusInfo.color, color: 'white' }}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className={`mt-2 flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <FiCalendar className="mr-1" />
                              <span className="mr-3">
                                {isToday(interviewDate) ? t('common.today') : 
                                 isTomorrow(interviewDate) ? t('common.tomorrow') : 
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg shadow-xl w-full max-w-md p-6 ${isDark ? 'bg-gray-800 shadow-gray-900/50' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editMode ? 'Edit Interview' : 'Schedule New Interview'}
              </h2>
              <motion.button 
                onClick={() => setShowForm(false)}
                className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX className="h-6 w-6" />
              </motion.button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="interviewGoal" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Interview Purpose/Goal*
                  </label>
                  <input
                    type="text"
                    id="interviewGoal"
                    name="interviewGoal"
                    value={formData.interviewGoal}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="e.g., Project Discussion, Initial Consultation"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date*
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formatDateString(formData.date)}
                      onChange={handleDateChange}
                      className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('form.time', { ns: 'interviews' })}*
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formatTimeString(formData.date)}
                      onChange={handleTimeChange}
                      className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="note" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('form.notes', { ns: 'interviews' })} ({t('optional', { ns: 'common' })})
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="3"
                    className={`block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder={t('form.notesPlaceholder', { ns: 'interviews' })}
                  ></textarea>
                </div>
                
                {editMode && selectedInterview && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('status.label', { ns: 'interviews' })}
                    </label>
                    <div className={`px-3 py-2 rounded-md ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                      <div className="flex items-center">
                        {(() => {
                          const statusInfo = getStatusInfo(selectedInterview.statusInterview);
                          return (
                            <>
                              <span 
                                className="inline-block w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: statusInfo.color }}
                              ></span>
                              <span>{statusInfo.label}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot ${isDark ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('common.cancel')}
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-coquelicot hover:bg-coquelicot-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot"
                    whileHover={{ scale: 1.05, backgroundColor: '#FF5722' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {editMode ? t('interviews.actions.updateInterview') : t('interviews.actions.scheduleInterview')}
                  </motion.button>
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
