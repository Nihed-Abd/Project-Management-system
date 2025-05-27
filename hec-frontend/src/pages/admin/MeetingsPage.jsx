import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiPlusCircle, FiCalendar, FiClock, FiUser, FiMessageSquare, FiCheckCircle, FiXCircle, FiEdit } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const MeetingsPage = () => {
  // Get theme context
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State management
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    date: new Date(),
    statusInterview: 'pending',
    interviewGoal: '',
    note: ''
  });
  const [users, setUsers] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('all');

  // Fetch meetings and users on component mount
  useEffect(() => {
    fetchMeetings();
    fetchUsers();
  }, []);

  // Fetch all meetings
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/interviews`);
      setMeetings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch meetings');
      setLoading(false);
      console.error('Error fetching meetings:', err);
    }
  };

  // Fetch all users (for user selection in form)
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Format meetings for the calendar
  const formatMeetingsForCalendar = useCallback(() => {
    return meetings
      .filter(meeting => filteredStatus === 'all' || meeting.statusInterview === filteredStatus)
      .map(meeting => ({
        id: meeting._id,
        title: `${meeting.userId?.name || 'Unknown User'} - ${meeting.interviewGoal}`,
        start: new Date(meeting.date),
        end: moment(meeting.date).add(1, 'hour').toDate(),
        status: meeting.statusInterview,
        allDay: false,
        resource: meeting
      }));
  }, [meetings, filteredStatus]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle date change from input
  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, date: new Date(e.target.value) }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      userId: '',
      date: new Date(),
      statusInterview: 'pending',
      interviewGoal: '',
      note: ''
    });
  };

  // Open modal for creating a new meeting
  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  // Open modal for editing an existing meeting
  const openEditModal = (meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      userId: meeting.userId?._id || '',
      date: new Date(meeting.date),
      statusInterview: meeting.statusInterview,
      interviewGoal: meeting.interviewGoal,
      note: meeting.note || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  // Submit form - create or update meeting
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Check for meeting conflicts
      const conflictingMeetings = checkForConflicts(formData.date);
      const isEditingSameMeeting = modalMode === 'edit' && 
        selectedMeeting && 
        conflictingMeetings.length === 1 && 
        conflictingMeetings[0].id === selectedMeeting._id;
      
      if (conflictingMeetings.length > 0 && !isEditingSameMeeting) {
        // Alert about conflict
        const confirmContinue = await Swal.fire({
          title: 'Meeting Conflict Detected',
          html: `There ${conflictingMeetings.length === 1 ? 'is' : 'are'} ${conflictingMeetings.length} other meeting${conflictingMeetings.length === 1 ? '' : 's'} scheduled at this time.<br>Do you want to continue anyway?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, schedule anyway',
          cancelButtonText: 'No, let me change the time',
          confirmButtonColor: '#f97316',
          cancelButtonColor: '#64748b',
        });
        
        if (!confirmContinue.isConfirmed) {
          return;
        }
      }
      
      if (modalMode === 'create') {
        // Create new meeting
        await axios.post(`${process.env.REACT_APP_API_URL}/api/interviews`, formData);
        Swal.fire({
          title: 'Success!',
          text: 'Meeting created successfully',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } else {
        // Update existing meeting
        await axios.put(`${process.env.REACT_APP_API_URL}/api/interviews/${selectedMeeting._id}`, formData);
        Swal.fire({
          title: 'Success!',
          text: 'Meeting updated successfully',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      }
      
      // Refresh meetings and close modal
      fetchMeetings();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving meeting:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save meeting',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Check for meeting conflicts
  const checkForConflicts = (date) => {
    const startTime = moment(date);
    const endTime = moment(date).add(1, 'hour');
    
    return meetings.filter(meeting => {
      // Skip the current meeting if we're editing
      if (modalMode === 'edit' && selectedMeeting && meeting._id === selectedMeeting._id) {
        return false;
      }
      
      const meetingStart = moment(meeting.date);
      const meetingEnd = moment(meeting.date).add(1, 'hour');
      
      // Check if there's any overlap
      return (
        (startTime.isSameOrAfter(meetingStart) && startTime.isBefore(meetingEnd)) ||
        (endTime.isAfter(meetingStart) && endTime.isSameOrBefore(meetingEnd)) ||
        (startTime.isSameOrBefore(meetingStart) && endTime.isSameOrAfter(meetingEnd))
      );
    });
  };

  // Handle changing meeting status
  const changeMeetingStatus = async (meetingId, newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/interviews/${meetingId}`, {
        statusInterview: newStatus
      });
      
      // Update local state
      setMeetings(prevMeetings => 
        prevMeetings.map(meeting => 
          meeting._id === meetingId 
            ? { ...meeting, statusInterview: newStatus } 
            : meeting
        )
      );
      
      Swal.fire({
        title: 'Status Updated',
        text: `Meeting ${newStatus === 'accepted' ? 'accepted' : newStatus === 'declined' ? 'declined' : 'marked as pending'}`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error updating meeting status:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update meeting status',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Delete meeting
  const deleteMeeting = async (meetingId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b'
      });
      
      if (result.isConfirmed) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/interviews/${meetingId}`);
        
        // Update local state
        setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting._id !== meetingId));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Meeting has been deleted.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (err) {
      console.error('Error deleting meeting:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete meeting',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Calendar event styling
  const eventStyleGetter = (event) => {
    let backgroundColor, borderColor, textColor;
    
    switch (event.status) {
      case 'accepted':
        backgroundColor = '#d1fae5'; // Green light bg
        borderColor = '#10b981';     // Green border
        textColor = '#047857';       // Green text
        break;
      case 'declined':
        backgroundColor = '#fee2e2'; // Red light bg
        borderColor = '#ef4444';     // Red border
        textColor = '#b91c1c';       // Red text
        break;
      default:
        backgroundColor = '#ffedd5'; // Orange light bg
        borderColor = '#f97316';     // Orange border
        textColor = '#c2410c';       // Orange text
    }
    
    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '4px',
        opacity: 1,
        color: textColor,
        fontWeight: '500',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        display: 'block',
        overflow: 'hidden'
      }
    };
  };

  // Render helper functions
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-900 text-green-100 border-green-800' : 'bg-green-100 text-green-800 border-green-200'} border`}><FiCheckCircle className="mr-1" /> Accepted</span>;
      case 'declined':
        return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-red-900 text-red-100 border-red-800' : 'bg-red-100 text-red-800 border-red-200'} border`}><FiXCircle className="mr-1" /> Declined</span>;
      default:
        return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-orange-900 text-orange-100 border-orange-800' : 'bg-orange-100 text-orange-800 border-orange-200'} border`}><FiClock className="mr-1" /> Pending</span>;
    }
  };

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : ''}`}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>Meetings Management</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-silver-200'}`}>Schedule and manage all meetings</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-coquelicot hover:bg-coquelicot-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlusCircle className="mr-2" /> Schedule New Meeting
        </button>
      </div>

      {/* Meeting Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-md shadow-sm border-l-4 border-coquelicot cursor-pointer transition-all hover:shadow-md ${filteredStatus === 'all' ? 'ring-2 ring-coquelicot ring-opacity-50' : ''}`}
          onClick={() => setFilteredStatus('all')}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className={`${isDark ? 'text-gray-300' : 'text-silver-200'} text-sm`}>Total Meetings</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>{meetings.length}</p>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-orange-100'} p-3 rounded-full`}>
              <FiCalendar className="text-coquelicot h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div 
          className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-md shadow-sm border-l-4 border-orange-500 cursor-pointer transition-all hover:shadow-md ${filteredStatus === 'pending' ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}`}
          onClick={() => setFilteredStatus('pending')}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className={`${isDark ? 'text-gray-300' : 'text-silver-200'} text-sm`}>Pending</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>{meetings.filter(m => m.statusInterview === 'pending').length}</p>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-orange-100'} p-3 rounded-full`}>
              <FiClock className="text-orange-500 h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div 
          className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-md shadow-sm border-l-4 border-green-500 cursor-pointer transition-all hover:shadow-md ${filteredStatus === 'accepted' ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
          onClick={() => setFilteredStatus('accepted')}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className={`${isDark ? 'text-gray-300' : 'text-silver-200'} text-sm`}>Accepted</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>{meetings.filter(m => m.statusInterview === 'accepted').length}</p>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-green-100'} p-3 rounded-full`}>
              <FiCheckCircle className="text-green-500 h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div 
          className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-md shadow-sm border-l-4 border-red-500 cursor-pointer transition-all hover:shadow-md ${filteredStatus === 'declined' ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}
          onClick={() => setFilteredStatus('declined')}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className={`${isDark ? 'text-gray-300' : 'text-silver-200'} text-sm`}>Declined</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-silver-100'}`}>{meetings.filter(m => m.statusInterview === 'declined').length}</p>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-red-100'} p-3 rounded-full`}>
              <FiXCircle className="text-red-500 h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-md shadow-sm mb-6`}>
        <div className="h-[600px]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coquelicot"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-red-500">{error}</div>
          ) : (
            <Calendar
              localizer={localizer}
              events={formatMeetingsForCalendar()}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => openEditModal(event.resource)}
              onSelectSlot={(slotInfo) => {
                // Pre-fill the form with the selected slot date
                resetForm();
                setFormData(prev => ({ ...prev, date: slotInfo.start }));
                setModalMode('create');
                setShowModal(true);
              }}
              selectable
              popup
              views={['month', 'week', 'day', 'agenda']}
              className={isDark ? 'rbc-calendar-dark' : ''}
              dayPropGetter={date => {
                return {
                  className: isDark ? 'rbc-day-dark' : '',
                  style: isDark ? { backgroundColor: '#1f2937', color: '#fff' } : {}
                };
              }}
              components={{
                event: (props) => {
                  const event = props.event;
                  return (
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs">{moment(event.start).format('h:mm A')}</div>
                    </div>
                  );
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Upcoming Meetings List */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold text-silver-100 mb-4">Upcoming Meetings</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coquelicot"></div>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center text-silver-200 py-8">No meetings scheduled</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings
                  .filter(meeting => filteredStatus === 'all' || meeting.statusInterview === filteredStatus)
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((meeting) => (
                    <tr key={meeting._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" 
                              src={meeting.userId?.picture || `https://ui-avatars.com/api/?name=${meeting.userId?.name || 'User'}&background=random`} 
                              alt={meeting.userId?.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-silver-100">{meeting.userId?.name || 'Unknown User'}</div>
                            <div className="text-sm text-silver-200">{meeting.userId?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="bg-gray-100 p-2 rounded-md">
                            <FiCalendar className="text-coquelicot" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-silver-100">{moment(meeting.date).format('MMMM D, YYYY')}</div>
                            <div className="text-sm text-silver-200">{moment(meeting.date).format('h:mm A')}</div>
                            <div className="text-xs text-gray-400">{moment(meeting.date).fromNow()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-silver-100">{meeting.interviewGoal}</div>
                        {meeting.note && (
                          <div className="text-sm text-silver-200 mt-1 max-w-xs overflow-hidden text-ellipsis">
                            <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">Note:</span> {meeting.note}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(meeting.statusInterview)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(meeting);
                            }}
                            className="bg-blue-50 p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Edit Meeting"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          
                          {meeting.statusInterview !== 'accepted' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                changeMeetingStatus(meeting._id, 'accepted');
                              }}
                              className="bg-green-50 p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                              title="Accept Meeting"
                            >
                              <FiCheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          {meeting.statusInterview !== 'declined' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                changeMeetingStatus(meeting._id, 'declined');
                              }}
                              className="bg-red-50 p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                              title="Decline Meeting"
                            >
                              <FiXCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMeeting(meeting._id);
                            }}
                            className="bg-red-50 p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Meeting"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Meeting Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden w-full max-w-lg mx-auto border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
            style={{
              maxHeight: '90vh',
              boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              borderTop: '4px solid #f97316'
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Modal header */}
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-orange-50 to-white'} px-6 py-4 border-b ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`${isDark ? 'bg-gray-600' : 'bg-coquelicot bg-opacity-10'} p-2.5 rounded-full mr-3`}>
                      {modalMode === 'create' ?
                        <FiPlusCircle className="h-6 w-6 text-coquelicot" /> :
                        <FiEdit className="h-6 w-6 text-coquelicot" />}
                    </div>
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-silver-100'}`}>
                      {modalMode === 'create' ? 'Schedule New Meeting' : 'Edit Meeting'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className={`${isDark ? 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600'} p-2 rounded-full focus:outline-none transition-colors`}
                    onClick={() => setShowModal(false)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal body */}
              <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-silver-100 mb-1">User</label>
                    <div className="relative">
                      <select
                        id="userId"
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        className="appearance-none block w-full pl-3 pr-10 py-2.5 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot shadow-sm"
                        required
                      >
                        <option value="">Select a user</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-silver-100 mb-1">Date and Time</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        id="date"
                        name="date"
                        value={formData.date ? moment(formData.date).format('YYYY-MM-DDTHH:mm') : ''}
                        onChange={handleDateChange}
                        className="appearance-none block w-full pl-3 pr-10 py-2.5 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot shadow-sm"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <FiCalendar className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="interviewGoal" className="block text-sm font-medium text-silver-100 mb-1">Meeting Purpose</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="interviewGoal"
                        name="interviewGoal"
                        value={formData.interviewGoal}
                        onChange={handleInputChange}
                        placeholder="Enter the purpose of this meeting"
                        className="appearance-none block w-full pl-3 pr-10 py-2.5 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot shadow-sm"
                        required
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <FiMessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="statusInterview" className="block text-sm font-medium text-silver-100 mb-1">Status</label>
                    <div className="relative">
                      <select
                        id="statusInterview"
                        name="statusInterview"
                        value={formData.statusInterview}
                        onChange={handleInputChange}
                        className="appearance-none block w-full pl-3 pr-10 py-2.5 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot shadow-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-silver-100 mb-1">Notes (Optional)</label>
                    <textarea
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Add any additional notes about this meeting"
                      className="appearance-none block w-full pl-3 pr-3 py-2.5 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-coquelicot shadow-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Modal footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-coquelicot border border-transparent rounded-md font-medium text-white hover:bg-coquelicot-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot transition-colors flex items-center"
                >
                  {modalMode === 'create' ? (
                    <>
                      <FiPlusCircle className="mr-2" />
                      Schedule Meeting
                    </>
                  ) : (
                    <>
                      <FiEdit className="mr-2" />
                      Update Meeting
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MeetingsPage;
