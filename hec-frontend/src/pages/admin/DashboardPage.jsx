import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaProjectDiagram, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

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

const RecentActivity = () => {
  const activities = [
    { user: 'John Doe', action: 'created a new project', time: '2 hours ago' },
    { user: 'Jane Smith', action: 'scheduled a meeting', time: '3 hours ago' },
    { user: 'Michael Brown', action: 'submitted a reclamation', time: '5 hours ago' },
    { user: 'Sarah Johnson', action: 'registered as a new user', time: '1 day ago' },
    { user: 'David Wilson', action: 'updated a project status', time: '1 day ago' },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-medium">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center border-b border-gray-100 pb-3"
          >
            <div className="h-8 w-8 rounded-full bg-coquelicot-50 text-center text-coquelicot-600 flex items-center justify-center">
              {activity.user.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const UpcomingMeetings = () => {
  const meetings = [
    { title: 'Project Kickoff', date: 'May 25, 2025', time: '10:00 AM' },
    { title: 'Client Consultation', date: 'May 26, 2025', time: '2:30 PM' },
    { title: 'Team Weekly Sync', date: 'May 27, 2025', time: '9:00 AM' },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-medium">Upcoming Meetings</h2>
      <div className="space-y-4">
        {meetings.map((meeting, index) => (
          <div key={index} className="flex items-center border-b border-gray-100 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <FaCalendarAlt className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium">{meeting.title}</p>
              <p className="text-sm text-gray-500">
                {meeting.date} at {meeting.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectStatus = () => {
  const statuses = [
    { name: 'Demandé', count: 8, color: 'bg-blue-50 text-blue-600' },
    { name: 'Accepteé', count: 12, color: 'bg-amber-50 text-amber-600' },
    { name: 'En cours', count: 5, color: 'bg-coquelicot-50 text-coquelicot-600' },
    { name: 'terminé', count: 20, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-medium">Project Status</h2>
      <div className="space-y-4">
        {statuses.map((status, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${status.color.split(' ')[0]}`}></div>
              <span className="ml-2">{status.name}</span>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs ${status.color}`}>
              {status.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FaUsers className="h-6 w-6 text-blue-600" />}
            title="Total Users"
            value="125"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            icon={<FaProjectDiagram className="h-6 w-6 text-coquelicot-600" />}
            title="Active Projects"
            value="45"
            bgColor="bg-coquelicot-50"
            textColor="text-coquelicot-600"
          />
          <StatCard
            icon={<FaCalendarAlt className="h-6 w-6 text-green-600" />}
            title="Meetings"
            value="15"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatCard
            icon={<FaExclamationTriangle className="h-6 w-6 text-amber-600" />}
            title="Reclamations"
            value="8"
            bgColor="bg-amber-50"
            textColor="text-amber-600"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="space-y-6 lg:ml-4">
            <UpcomingMeetings />
            <ProjectStatus />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
