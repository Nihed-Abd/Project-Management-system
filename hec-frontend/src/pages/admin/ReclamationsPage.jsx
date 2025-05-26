import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
import 'animate.css';
import { FiMessageSquare, FiFilter, FiSearch, FiCheckCircle, FiClock, FiUser, FiMail, FiInfo, FiCalendar, FiEdit, FiX, FiSend } from 'react-icons/fi';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const ReclamationsPage = () => {
  // State management
  const [reclamations, setReclamations] = useState([]);
  const [filteredReclamations, setFilteredReclamations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'desc' });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    answered: 0
  });

  // Fetch reclamations and users data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch reclamations
        const reclamationsRes = await axios.get('/api/reclamations');
        console.log('Reclamations data:', reclamationsRes.data);
        setReclamations(reclamationsRes.data);
        setFilteredReclamations(reclamationsRes.data);
        
        // Fetch users
        const usersRes = await axios.get('/api/users');
        console.log('Users data:', usersRes.data);
        setUsers(usersRes.data);
        
        // Calculate stats
        const total = reclamationsRes.data.length;
        const pending = reclamationsRes.data.filter(rec => rec.statusRec === 'pending').length;
        
        setStats({
          total,
          pending,
          answered: total - pending
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Status code:', error.response.status);
        } else if (error.request) {
          console.error('No response received:', error.request);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let result = reclamations;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        rec => 
          (rec.object && rec.object.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (rec.message && rec.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (rec.userId && rec.userId.name && rec.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (rec.userId && rec.userId.email && rec.userId.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(rec => rec.statusRec === filterStatus);
    }
    
    setFilteredReclamations(result);
  }, [searchTerm, filterStatus, reclamations]);

  // Handle submitting a response with confirmation
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    
    if (!responseContent.trim()) {
      // Show warning if response is empty
      Swal.fire({
        icon: 'warning',
        title: 'Empty Response',
        text: 'Please enter a response before submitting',
        confirmButtonColor: '#f97316',
        customClass: {
          popup: 'animated fadeInDown faster'
        }
      });
      return;
    }
    
    // Ask for confirmation before submitting
    const result = await Swal.fire({
      title: 'Send Response?',
      text: `Are you sure you want to respond to this reclamation from ${selectedReclamation.userId?.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, send it!',
      cancelButtonText: 'Not yet',
      customClass: {
        popup: 'animated zoomIn faster',
        confirmButton: 'btn-confirm',
        cancelButton: 'btn-cancel'
      }
    });
    
    // If user canceled, return early
    if (!result.isConfirmed) {
      return;
    }
    
    // Show loading state
    Swal.fire({
      title: 'Sending...',
      html: 'Please wait while we process your response',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'animated fadeIn faster'
      }
    });
    
    try {
      // Get current user (admin) ID from localStorage
      const adminId = localStorage.getItem('userId');
      
      // First update the reclamation directly
      const reclamationUpdateResponse = await axios.put(`/api/reclamations/${selectedReclamation._id}`, {
        adminResponse: responseContent,
        statusRec: 'Answered'
      });
      
      // Then create a response record (if the API is ready)
      try {
        await axios.post('/api/responses', {
          reclamationId: selectedReclamation._id,
          adminId,
          content: responseContent
        });
      } catch (responseError) {
        console.log('Note: Response creation API might not be fully set up:', responseError);
      }
      
      // Update reclamation in state
      const updatedReclamations = reclamations.map(rec => {
        if (rec._id === selectedReclamation._id) {
          return {
            ...rec,
            statusRec: 'Answered',
            dateAnswer: new Date(),
            adminResponse: responseContent
          };
        }
        return rec;
      });
      
      setReclamations(updatedReclamations);
      setFilteredReclamations(prev => {
        return prev.map(rec => {
          if (rec._id === selectedReclamation._id) {
            return {
              ...rec,
              statusRec: 'Answered',
              dateAnswer: new Date(),
              adminResponse: responseContent
            };
          }
          return rec;
        });
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        answered: prev.answered + 1
      }));
      
      // Show beautiful success message with SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Response Sent!',
        text: 'Your response has been submitted successfully',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: 'animated fadeInUp faster',
          icon: 'animated heartBeat delay-1s',
          title: 'text-success',
          timerProgressBar: 'timer-progress'
        }
      });
      
      // Close modal and reset form
      setShowResponseModal(false);
      setResponseContent('');
      setSelectedReclamation(null);
    } catch (error) {
      console.error('Error submitting response:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.response.data.message || 'Failed to submit response',
          confirmButtonColor: '#f97316',
          customClass: {
            popup: 'animated shakeX',
            title: 'text-error'
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Something went wrong',
          text: 'Failed to submit response. Please try again later.',
          confirmButtonColor: '#f97316',
          customClass: {
            popup: 'animated shakeX',
            title: 'text-error'
          }
        });
      }
    }
  };

  // Open response modal
  const openResponseModal = (reclamation) => {
    setSelectedReclamation(reclamation);
    setResponseContent(reclamation.adminResponse || '');
    setShowResponseModal(true);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setFilterStatus(status);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Apply sorting to filtered reclamations
    const sortedReclamations = [...filteredReclamations].sort((a, b) => {
      if (key === 'dateCreation' || key === 'dateAnswer') {
        // Date sorting
        const dateA = new Date(a[key] || 0);
        const dateB = new Date(b[key] || 0);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (key === 'userId') {
        // User name sorting
        const nameA = (a.userId?.name || '').toLowerCase();
        const nameB = (b.userId?.name || '').toLowerCase();
        return direction === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        // String sorting
        const valueA = (a[key] || '').toLowerCase();
        const valueB = (b[key] || '').toLowerCase();
        return direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
    
    setFilteredReclamations(sortedReclamations);
  };
  
  // Get sort direction icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="text-coquelicot ml-1">↑</span> 
      : <span className="text-coquelicot ml-1">↓</span>;
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-silver-100 mb-2">Reclamations Management</h1>
        <p className="text-silver-200">View and respond to user reclamations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FiMessageSquare className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-silver-200 text-sm">Total Reclamations</p>
              <p className="text-2xl font-bold text-silver-100">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <FiClock className="text-yellow-500 text-xl" />
            </div>
            <div>
              <p className="text-silver-200 text-sm">Pending</p>
              <p className="text-2xl font-bold text-silver-100">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FiCheckCircle className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-silver-200 text-sm">Answered</p>
              <p className="text-2xl font-bold text-silver-100">{stats.answered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-silver-200" />
            <span className="text-silver-100 font-medium">Filter by Status:</span>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleStatusFilterChange('all')}
                className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'all' 
                  ? 'bg-silver-100 text-white' 
                  : 'bg-gray-100 text-silver-200 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => handleStatusFilterChange('pending')}
                className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => handleStatusFilterChange('Answered')}
                className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'Answered' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                Answered
              </button>
            </div>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-silver-200" />
            </div>
            <input
              type="text"
              placeholder="Search reclamations..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coquelicot focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Reclamations List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-silver-200">Loading reclamations...</div>
        ) : filteredReclamations.length === 0 ? (
          <div className="p-8 text-center">
            <FiMessageSquare className="text-4xl text-gray-300 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-silver-100">No reclamations found</h3>
            <p className="text-silver-200 mt-1">
              {searchTerm || filterStatus !== 'all'
                ? 'Try changing your search or filter criteria'
                : 'There are no reclamations yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-silver-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('userId')}
                  >
                    <div className="flex items-center">
                      User {getSortIcon('userId')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-silver-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('object')}
                  >
                    <div className="flex items-center">
                      Subject {getSortIcon('object')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-silver-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('dateCreation')}
                  >
                    <div className="flex items-center">
                      Date {getSortIcon('dateCreation')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-silver-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('statusRec')}
                  >
                    <div className="flex items-center">
                      Status {getSortIcon('statusRec')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-silver-200 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReclamations.map((reclamation) => (
                  <tr key={reclamation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {reclamation.userId?.picture ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={reclamation.userId.picture} 
                              alt={reclamation.userId.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-silver-100">
                            {reclamation.userId?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-silver-200">
                            {reclamation.userId?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-silver-100">{reclamation.object}</div>
                      <div className="text-sm text-silver-200 truncate max-w-xs">
                        {reclamation.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-silver-100">
                        {moment(reclamation.dateCreation).format('MMM D, YYYY')}
                      </div>
                      <div className="text-xs text-silver-200">
                        {moment(reclamation.dateCreation).format('h:mm A')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${reclamation.statusRec === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'}`}
                      >
                        {reclamation.statusRec}
                      </span>
                      {reclamation.statusRec === 'Answered' && (
                        <div className="text-xs text-silver-200 mt-1">
                          {moment(reclamation.dateAnswer).format('MMM D, YYYY')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-silver-200">
                      <button
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-white ${
                          reclamation.statusRec === 'pending'
                            ? 'bg-coquelicot hover:bg-coquelicot-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot`}
                        onClick={() => openResponseModal(reclamation)}
                      >
                        {reclamation.statusRec === 'pending' ? (
                          <>
                            <FiEdit className="mr-1" /> Respond
                          </>
                        ) : (
                          <>
                            <FiInfo className="mr-1" /> View
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReclamation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-25">
          <div
            className="bg-white rounded-xl overflow-hidden w-full max-w-2xl mx-auto border border-gray-100"
            style={{
              maxHeight: '90vh',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              borderTop: '4px solid #f97316'
            }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-coquelicot bg-opacity-10 p-2.5 rounded-full mr-3">
                    <FiMessageSquare className="h-6 w-6 text-coquelicot" />
                  </div>
                  <h3 className="text-xl font-semibold text-silver-100">
                    {selectedReclamation.statusRec === 'pending' 
                      ? 'Respond to Reclamation' 
                      : 'Reclamation Details'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  onClick={() => setShowResponseModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Reclamation Details */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <FiUser className="text-silver-200 mr-2" />
                    <span className="text-sm font-medium text-silver-200">From:</span>
                  </div>
                  <div className="ml-6 mb-4">
                    <div className="flex items-center">
                      {selectedReclamation.userId?.picture ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={selectedReclamation.userId.picture} 
                          alt={selectedReclamation.userId.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FiUser className="text-gray-500" />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-silver-100 font-medium">
                          {selectedReclamation.userId?.name || 'Unknown User'}
                        </p>
                        <p className="text-silver-200 text-sm">
                          {selectedReclamation.userId?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FiCalendar className="text-silver-200 mr-2" />
                    <span className="text-sm font-medium text-silver-200">Date Submitted:</span>
                  </div>
                  <p className="ml-6 text-silver-100 mb-4">
                    {moment(selectedReclamation.dateCreation).format('MMMM D, YYYY [at] h:mm A')}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <FiInfo className="text-silver-200 mr-2" />
                  <span className="text-sm font-medium text-silver-200">Subject:</span>
                </div>
                <p className="ml-6 text-silver-100 font-medium">{selectedReclamation.object}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-start mb-2">
                  <FiMessageSquare className="text-silver-200 mr-2 mt-1" />
                  <span className="text-sm font-medium text-silver-200">Description:</span>
                </div>
                <div className="ml-6 bg-white p-4 rounded-lg border border-gray-200 text-silver-100">
                  {selectedReclamation.message}
                </div>
              </div>

              {selectedReclamation.statusRec === 'Answered' && selectedReclamation.adminResponse && (
                <div className="mb-4">
                  <div className="flex items-start mb-2">
                    <FiEdit className="text-silver-200 mr-2 mt-1" />
                    <span className="text-sm font-medium text-silver-200">Your Response:</span>
                  </div>
                  <div className="ml-6 bg-blue-50 p-4 rounded-lg border border-blue-200 text-silver-100">
                    {selectedReclamation.adminResponse}
                  </div>
                  <div className="ml-6 mt-2 text-xs text-silver-200">
                    Responded on {moment(selectedReclamation.dateAnswer).format('MMMM D, YYYY [at] h:mm A')}
                  </div>
                </div>
              )}
            </div>

            {/* Response Form */}
            {selectedReclamation.statusRec === 'pending' && (
              <form onSubmit={handleSubmitResponse}>
                <div className="px-6 py-4">
                  <label htmlFor="response" className="block text-sm font-medium text-silver-100 mb-2">
                    Your Response
                  </label>
                  <textarea
                    id="response"
                    rows="4"
                    className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-coquelicot focus:border-coquelicot"
                    placeholder="Write your response here..."
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot transition-colors"
                    onClick={() => {
                      Swal.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, cancel!'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          setShowResponseModal(false)
                        }
                      })
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-coquelicot border border-transparent rounded-md font-medium text-white hover:bg-coquelicot-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot transition-colors flex items-center animate__animated animate__pulse animate__infinite animate__slower"
                  >
                    <FiSend className="mr-2" />
                    Send Response
                  </button>
                </div>
              </form>
            )}

            {/* View Only Footer */}
            {selectedReclamation.statusRec === 'Answered' && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coquelicot transition-colors"
                  onClick={() => setShowResponseModal(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReclamationsPage;
