import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiTag, FiClock } from 'react-icons/fi';
import axios from 'axios';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/public/projects/${projectId}`);
        
        if (response.data) {
          setProject(response.data.project || response.data);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coquelicot"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
            <Link 
              to="/projects"
              className="inline-flex items-center text-coquelicot hover:underline"
            >
              <FiArrowLeft className="mr-2" /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            to="/projects"
            className="inline-flex items-center text-coquelicot hover:underline"
          >
            <FiArrowLeft className="mr-2" /> Back to Projects
          </Link>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{project.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <FiCalendar className="mr-1 text-gray-400" />
              <span>Created: {new Date(project.creationDate || project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <FiTag className="mr-1 text-gray-400" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'terminé' ? 'bg-green-100 text-green-800' :
                project.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                project.status === 'Accepteé' ? 'bg-blue-100 text-blue-800' :
                project.status === 'Demandé' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {project.status}
              </span>
            </div>
            {project.LastEditDate && (
              <div className="flex items-center">
                <FiClock className="mr-1 text-gray-400" />
                <span>Last updated: {new Date(project.LastEditDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Project Media Gallery */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="bg-gray-50 rounded-xl p-4 md:p-6">
            {project.pictures && project.pictures.length > 0 ? (
              <>
                <div className="relative rounded-xl overflow-hidden h-64 md:h-80 lg:h-96 mb-4">
                  <img 
                    src={project.pictures[activeImage]} 
                    alt={`${project.title} - Image ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {project.pictures.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {project.pictures.map((pic, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${activeImage === index ? 'border-coquelicot' : 'border-transparent'}`}
                      >
                        <img src={pic} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
                <p className="text-gray-400">No images available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Project Description</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>{project.description || 'No description available.'}</p>
            </div>
            
            {project.location && project.location.coordinates && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Project Location</h2>
                <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Map location: {project.location.coordinates[1]}, {project.location.coordinates[0]}</p>
                </div>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Project Info</h2>
              
              {project.categoryId && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-gray-800">{project.categoryId.name || 'Unknown'}</p>
                </div>
              )}
              
              {project.userId && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-1 text-gray-800">{project.userId.name || 'Unknown client'}</p>
                </div>
              )}
              
              <div className="mt-6">
                <Link 
                  to="/contact" 
                  className="block w-full text-center bg-coquelicot hover:bg-coquelicot-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Request Similar Project
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
