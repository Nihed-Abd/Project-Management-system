import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import { 
  FaUsers, 
  FaProjectDiagram, 
  FaCalendarAlt, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaComment,
  FaChartPie,
  FaChartLine,
  FaChartBar,
  FaUserCheck,
  FaUserTimes,
  FaRegClock,
  FaCalendarCheck
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const StatCard = ({ icon, title, value, bgColor, textColor }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-lg ${bgColor} p-6 shadow-sm border border-gray-100`}
    >
      <div className="flex items-center">
        <div className={`mr-4 rounded-full ${bgColor} p-3`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-semibold ${textColor}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const RecentActivity = ({ activities = [] }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-medium text-silver-100">Recent Activity</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center border-b border-gray-100 pb-3"
            >
              <div className="h-10 w-10 rounded-full bg-coquelicot-50 text-center text-coquelicot-600 flex items-center justify-center">
                {activity.user.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
              <div className="ml-2">
                {activity.type === 'project' && (
                  <FaProjectDiagram className="text-blue-500" />
                )}
                {activity.type === 'meeting' && (
                  <FaCalendarAlt className="text-green-500" />
                )}
                {activity.type === 'reclamation' && (
                  <FaExclamationTriangle className="text-amber-500" />
                )}
                {activity.type === 'message' && (
                  <FaEnvelope className="text-purple-500" />
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">No recent activities</div>
        )}
      </div>
    </div>
  );
};

const UpcomingMeetings = ({ meetings = [] }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-medium text-silver-100">Upcoming Meetings</h2>
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {meetings.length > 0 ? (
          meetings.map((meeting, index) => (
            <div key={index} className="flex items-center border-b border-gray-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <FaCalendarAlt className="text-green-600" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium">{meeting.title}</p>
                <p className="text-sm text-gray-500">
                  {meeting.date} at {meeting.time}
                </p>
                <p className="text-xs text-gray-500">With {meeting.user}</p>
              </div>
              <div className="ml-2">
                {meeting.status === 'pending' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                )}
                {meeting.status === 'accepted' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Accepted
                  </span>
                )}
                {meeting.status === 'declined' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Declined
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">No upcoming meetings</div>
        )}
      </div>
    </div>
  );
};

// Chart Components
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

// Project Distribution Chart (Pie Chart)
const ProjectDistributionChart = ({ stats }) => {
  console.log('ProjectDistributionChart stats:', stats);
  
  const data = [
    { name: 'Pending', value: stats.pending, color: COLORS[0] },
    { name: 'Accepted', value: stats.accepted, color: COLORS[1] },
    { name: 'In Progress', value: stats.inProgress, color: COLORS[2] },
    { name: 'Completed', value: stats.completed, color: COLORS[3] }
  ].filter(item => item.value > 0);

  return (
    <div className="h-64">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          {stats.total > 0 ? 'Projects exist but no status data available' : 'No project data available'}
        </div>
      )}
    </div>
  );
};

// User Status Chart (Pie Chart)
const UserStatusChart = ({ stats }) => {
  const data = [
    { name: 'Active', value: stats.active, color: COLORS[1] },
    { name: 'Inactive', value: stats.inactive, color: COLORS[0] }
  ].filter(item => item.value > 0);

  return (
    <div className="h-64">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">No user data available</div>
      )}
    </div>
  );
};

// Meeting Status Chart (Pie Chart)
const MeetingStatusChart = ({ stats }) => {
  const data = [
    { name: 'Pending', value: stats.pending, color: COLORS[0] },
    { name: 'Accepted', value: stats.accepted, color: COLORS[1] },
    { name: 'Declined', value: stats.declined, color: COLORS[3] }
  ].filter(item => item.value > 0);

  return (
    <div className="h-64">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} meetings`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">No meeting data available</div>
      )}
    </div>
  );
};

// Reclamation Status Chart (Pie Chart)
const ReclamationStatusChart = ({ stats }) => {
  const data = [
    { name: 'Pending', value: stats.pending, color: COLORS[0] },
    { name: 'Answered', value: stats.answered, color: COLORS[1] }
  ].filter(item => item.value > 0);

  return (
    <div className="h-64">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} reclamations`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">No reclamation data available</div>
      )}
    </div>
  );
};

// Monthly Activity Chart (Bar Chart)
const MonthlyActivityChart = ({ data = [] }) => {
  console.log('Monthly activity data:', data);
  // Check if we have any non-zero data
  const hasData = data.some(month => 
    month.projects > 0 || month.meetings > 0 || 
    month.reclamations > 0 || month.messages > 0
  );
  
  return (
    <div className="h-80">
      {data.length > 0 && hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="projects" name="Projects" fill={COLORS[0]} />
            <Bar dataKey="meetings" name="Meetings" fill={COLORS[1]} />
            <Bar dataKey="reclamations" name="Reclamations" fill={COLORS[2]} />
            <Bar dataKey="messages" name="Messages" fill={COLORS[3]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          {data.length > 0 ? 'No activity recorded in recent months' : 'No monthly data available'}
        </div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  // State for all statistics and data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    projects: { total: 0, pending: 0, accepted: 0, inProgress: 0, completed: 0 },
    meetings: { total: 0, upcoming: 0, pending: 0, accepted: 0, declined: 0 },
    reclamations: { total: 0, pending: 0, answered: 0 },
    messages: { total: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  
  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all necessary data in parallel
        const [usersRes, projectsRes, meetingsRes, reclamationsRes, messagesRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/projects'),
          axios.get('/api/interviews'),
          axios.get('/api/reclamations'),
          axios.get('/api/messages')
        ]);
        
        // Debug response data
        console.log('Users API response:', usersRes.data);
        console.log('Projects API response:', projectsRes.data);
        console.log('Meetings API response:', meetingsRes.data);
        console.log('Reclamations API response:', reclamationsRes.data);
        console.log('Messages API response:', messagesRes.data);
        
        // Process users data - ensure it's an array
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const activeUsers = users.filter(user => user.isActive).length;
        
        // Process projects data - handle the nested structure
        let projects = [];
        if (projectsRes.data && projectsRes.data.projects && Array.isArray(projectsRes.data.projects)) {
          // If projects are in a nested 'projects' property
          projects = projectsRes.data.projects;
        } else if (Array.isArray(projectsRes.data)) {
          // If projects are directly in the response
          projects = projectsRes.data;
        }
        console.log('Projects array extracted:', projects);
        
        // Check project statuses and count them
        let pendingProjects = 0;
        let acceptedProjects = 0;
        let inProgressProjects = 0;
        let completedProjects = 0;
        
        projects.forEach(project => {
          // Log the full project to debug its structure
          console.log('Project object:', project);
          
          // Check status using the correct field name (status, not statusProject)
          const projectStatus = project.status || project.statusProject;
          console.log('Project status:', projectStatus);
          
          if (projectStatus === 'Demandé') pendingProjects++;
          else if (projectStatus === 'Accepteé') acceptedProjects++;
          else if (projectStatus === 'En cours') inProgressProjects++;
          else if (projectStatus === 'terminé') completedProjects++;
        });
        
        console.log('Project counts:', { 
          pending: pendingProjects, 
          accepted: acceptedProjects, 
          inProgress: inProgressProjects, 
          completed: completedProjects,
          total: projects.length
        });
        
        // Process meetings data - ensure it's an array
        const meetings = Array.isArray(meetingsRes.data) ? meetingsRes.data : [];
        console.log('Meetings array:', meetings);
        const upcomingMeetingsData = meetings
          .filter(meeting => new Date(meeting.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        const pendingMeetings = meetings.filter(meeting => meeting.statusInterview === 'pending').length;
        const acceptedMeetings = meetings.filter(meeting => meeting.statusInterview === 'accepted').length;
        const declinedMeetings = meetings.filter(meeting => meeting.statusInterview === 'declined').length;
        
        // Process reclamations data - ensure it's an array
        const reclamations = Array.isArray(reclamationsRes.data) ? reclamationsRes.data : [];
        console.log('Reclamations array:', reclamations);
        const pendingReclamations = reclamations.filter(rec => rec.statusRec === 'pending').length;
        const answeredReclamations = reclamations.filter(rec => rec.statusRec === 'Answered').length;
        
        // Process messages data - ensure it's an array
        const messages = Array.isArray(messagesRes.data) ? messagesRes.data : [];
        console.log('Messages array:', messages);
        
        // Handle case where projectsRes.data.count might exist
        const projectsCount = projectsRes.data && projectsRes.data.count ? 
          projectsRes.data.count : projects.length;

        console.log('Setting total projects count to:', projectsCount);
        
        // Update stats state with the correct counts
        setStats({
          users: { 
            total: users.length, 
            active: activeUsers, 
            inactive: users.length - activeUsers 
          },
          projects: { 
            // Use either the count from API or the length of the array
            total: projectsCount, 
            pending: pendingProjects, 
            accepted: acceptedProjects, 
            inProgress: inProgressProjects, 
            completed: completedProjects 
          },
          meetings: { 
            total: meetings.length, 
            upcoming: upcomingMeetingsData.length, 
            pending: pendingMeetings, 
            accepted: acceptedMeetings, 
            declined: declinedMeetings 
          },
          reclamations: { 
            total: reclamations.length, 
            pending: pendingReclamations, 
            answered: answeredReclamations 
          },
          messages: { 
            total: messages.length 
          }
        });
        
        // Set upcoming meetings
        setUpcomingMeetings(upcomingMeetingsData.map(meeting => ({
          title: meeting.interviewGoal || 'Meeting',
          date: moment(meeting.date).format('MMM D, YYYY'),
          time: moment(meeting.date).format('h:mm A'),
          status: meeting.statusInterview,
          user: meeting.userId?.name || 'Unknown User'
        })));
        
        // Create recent activities from all collected data
        let activities = [];
        
        try {
          // Add projects activity if we have projects
          if (projects.length > 0) {
            activities = [
              ...activities,
              ...projects.slice(0, 5).map(project => ({
                user: project.clientId?.name || project.userId?.name || 'A client',
                action: `created a new project: ${project.title || 'New Project'}`,
                time: moment(project.creationDate || project.dateCreation || project.LastEditDate).fromNow(),
                type: 'project'
              }))
            ];
          }
          
          // Add meetings activity if we have meetings
          if (meetings.length > 0) {
            activities = [
              ...activities,
              ...meetings.slice(0, 5).map(meeting => ({
                user: meeting.userId?.name || 'A user',
                action: `scheduled a meeting: ${meeting.interviewGoal || 'Meeting'}`,
                time: moment(meeting.date).fromNow(),
                type: 'meeting'
              }))
            ];
          }
          
          // Add reclamations activity if we have reclamations
          if (reclamations.length > 0) {
            activities = [
              ...activities,
              ...reclamations.slice(0, 5).map(rec => ({
                user: rec.userId?.name || 'A user',
                action: `submitted a reclamation: ${rec.object || 'Issue'}`,
                time: moment(rec.dateCreation).fromNow(),
                type: 'reclamation'
              }))
            ];
          }
          
          // Add messages activity if we have messages
          if (messages.length > 0) {
            activities = [
              ...activities,
              ...messages.slice(0, 5).map(msg => ({
                user: msg.name || 'A visitor',
                action: `sent a message: ${msg.subject || 'Message'}`,
                time: moment(msg.createdAt || msg.date).fromNow(),
                type: 'message'
              }))
            ];
          }
        } catch (error) {
          console.error('Error creating activities:', error);
          activities = [];
        }
        
        // Sort activities by time (assuming they all have a timestamp) and take top 10
        const sortedActivities = activities.sort((a, b) => {
          return moment(b.time, 'fromNow').diff(moment(a.time, 'fromNow'));
        }).slice(0, 10);
        
        setRecentActivities(sortedActivities);
        
        // Generate monthly statistics for the past 6 months
        const last6Months = [];
        try {
          for (let i = 5; i >= 0; i--) {
            const month = moment().subtract(i, 'months');
            const monthName = month.format('MMM');
            const monthStart = month.startOf('month');
            const monthEnd = month.endOf('month');
            
            // Count projects in this month
            let projectsInMonth = 0;
            projects.forEach(p => {
              // Check both possible date field names
              const dateField = p.creationDate || p.dateCreation || p.LastEditDate;
              if (dateField) {
                const createdAt = moment(dateField);
                if (createdAt.isBetween(monthStart, monthEnd, null, '[]')) {
                  projectsInMonth++;
                }
              }
            });
            
            // Count meetings in this month
            let meetingsInMonth = 0;
            meetings.forEach(m => {
              if (m.date) {
                const meetingDate = moment(m.date);
                if (meetingDate.isBetween(monthStart, monthEnd, null, '[]')) {
                  meetingsInMonth++;
                }
              }
            });
            
            // Count reclamations in this month
            let reclamationsInMonth = 0;
            reclamations.forEach(r => {
              if (r.dateCreation) {
                const createdAt = moment(r.dateCreation);
                if (createdAt.isBetween(monthStart, monthEnd, null, '[]')) {
                  reclamationsInMonth++;
                }
              }
            });
            
            // Count messages in this month
            let messagesInMonth = 0;
            messages.forEach(m => {
              if (m.createdAt || m.date) {
                const createdAt = moment(m.createdAt || m.date);
                if (createdAt.isBetween(monthStart, monthEnd, null, '[]')) {
                  messagesInMonth++;
                }
              }
            });
            
            // Add data for this month
            last6Months.push({
              name: monthName,
              projects: projectsInMonth,
              meetings: meetingsInMonth,
              reclamations: reclamationsInMonth,
              messages: messagesInMonth
            });
          }
          
          console.log('Monthly stats generated:', last6Months);
        } catch (error) {
          console.error('Error generating monthly stats:', error);
        }
        
        setMonthlyStats(last6Months);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  return (
    <div className="min-h-screen bg-transparent p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-silver-100">Admin Dashboard</h1>
          <div className="text-silver-200 text-sm">
            Last updated: {moment().format('MMMM D, YYYY, h:mm A')}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coquelicot"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<FaUsers className="h-6 w-6 text-blue-600" />}
                title="Total Users"
                value={stats.users.total}
                bgColor="bg-blue-50"
                textColor="text-blue-600"
              />
              <StatCard
                icon={<FaProjectDiagram className="h-6 w-6 text-coquelicot-600" />}
                title="Total Projects"
                value={stats.projects.total}
                bgColor="bg-coquelicot-50"
                textColor="text-coquelicot-600"
              />
              <StatCard
                icon={<FaCalendarAlt className="h-6 w-6 text-green-600" />}
                title="Total Meetings"
                value={stats.meetings.total}
                bgColor="bg-green-50"
                textColor="text-green-600"
              />
              <StatCard
                icon={<FaExclamationTriangle className="h-6 w-6 text-amber-600" />}
                title="Total Reclamations"
                value={stats.reclamations.total}
                bgColor="bg-amber-50"
                textColor="text-amber-600"
              />
            </div>

            {/* Charts and Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Project Distribution Chart */}
              <div className="bg-white rounded-lg shadow-md p-5 lg:col-span-1">
                <h2 className="text-lg font-medium mb-4 text-silver-100">Project Status</h2>
                <div className="mb-3 text-sm text-silver-200">Total Projects: {stats.projects.total}</div>
                <ProjectDistributionChart stats={stats.projects} />
              </div>
              
              {/* Monthly Activity Chart */}
              <div className="bg-white rounded-lg shadow-md p-5 lg:col-span-2">
                <h2 className="text-lg font-medium mb-4 text-silver-100">Monthly Activity</h2>
                <MonthlyActivityChart data={monthlyStats} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* User Status Chart */}
              <div className="bg-white rounded-lg shadow-md p-5">
                <h2 className="text-lg font-medium mb-4 text-silver-100">User Status</h2>
                <div className="mb-3 text-sm text-silver-200">Total Users: {stats.users.total}</div>
                <UserStatusChart stats={stats.users} />
              </div>
              
              {/* Meeting Status Chart */}
              <div className="bg-white rounded-lg shadow-md p-5">
                <h2 className="text-lg font-medium mb-4 text-silver-100">Meeting Status</h2>
                <div className="mb-3 text-sm text-silver-200">Total Meetings: {stats.meetings.total}</div>
                <MeetingStatusChart stats={stats.meetings} />
              </div>
              
              {/* Reclamation Status Chart */}
              <div className="bg-white rounded-lg shadow-md p-5">
                <h2 className="text-lg font-medium mb-4 text-silver-100">Reclamation Status</h2>
                <div className="mb-3 text-sm text-silver-200">Total Reclamations: {stats.reclamations.total}</div>
                <ReclamationStatusChart stats={stats.reclamations} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivity activities={recentActivities} />
              </div>
              <div>
                <UpcomingMeetings meetings={upcomingMeetings} />
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
