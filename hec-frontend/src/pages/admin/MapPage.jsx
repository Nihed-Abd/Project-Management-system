import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { FaSpinner, FaLayerGroup, FaUser, FaCalendarAlt } from 'react-icons/fa';

// Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoibmloZWR4dG4iLCJhIjoiY205cmNmNDZoMHc3bTJpczQ3b3FodWVibCJ9.MBPaL38J-sYOaaw2BUQO0Q';

// Helper function to get marker color based on status
const getStatusColor = (status) => {
  switch(status) {
    case 'Demandé': return '#2563EB'; // Blue
    case 'Accepteé': return '#CA8A04'; // Yellow
    case 'En cours': return '#D92D0C'; // Coquelicot (main brand color)
    case 'terminé': return '#059669'; // Green
    default: return '#6B7280'; // Gray
  }
};

const MapPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Get unique statuses from projects
  const statuses = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const statusSet = new Set(projects.map(project => project.status));
    return ['all', ...Array.from(statusSet)];
  }, [projects]);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/map/projects-locations');
        setProjects(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
      center: [10.183333, 36.8], // Center on Tunis
      zoom: 8,
      pitch: 45, // Tilt the map for 3D effect
      bearing: 0,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Setup map for 3D buildings and set loaded state
    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add 3D building layer
      const layers = map.current.getStyle().layers;
      
      // Find the first symbol layer in the map style
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      // Add 3D building layer
      map.current.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        // Remove all markers before removing map
        if (markersRef.current) {
          markersRef.current.forEach(marker => marker.remove());
        }
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Filtered projects based on status
  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') return projects;
    return projects.filter(project => project.status === statusFilter);
  }, [projects, statusFilter]);

  // Add markers for projects after map is loaded and projects are fetched
  useEffect(() => {
    // Clear previous markers when filter changes
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }
    
    if (!map.current || !mapLoaded || loading || filteredProjects.length === 0) {
      return;
    }
    
    // Add markers for each project with location data
    filteredProjects.forEach(project => {
      if (project.location && project.location.coordinates) {
        const [longitude, latitude] = project.location.coordinates;
        
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'marker';
        
        // Create marker style based on project status
        const statusColor = getStatusColor(project.status);
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = statusColor;
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        
        // Add animation effect on hover
        el.style.transition = 'all 0.2s ease-in-out';
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });
        
        // Format project creation date
        const creationDate = new Date(project.creationDate).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        
        // Create popup with more detailed information
        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
          .setHTML(`
            <div class="popup-content p-2">
              <div class="flex items-start">
                ${project.pictures && project.pictures.length > 0 ? 
                  `<img src="${project.pictures[0]}" alt="${project.title}" class="w-20 h-20 object-cover rounded-md mr-3">` : 
                  ''}
                <div>
                  <h3 class="font-bold text-coquelicot-500 text-lg">${project.title}</h3>
                  <div class="flex items-center mt-1">
                    <span class="inline-block w-3 h-3 rounded-full mr-1" style="background-color: ${getStatusColor(project.status)}"></span>
                    <span class="text-sm font-medium" style="color: ${getStatusColor(project.status)}">${project.status}</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-2">
                <p class="text-sm text-gray-700">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>
              </div>
              
              <div class="mt-3 text-xs text-gray-600 grid grid-cols-2 gap-2">
                <div class="flex items-center">
                  <FaLayerGroup class="mr-1" />
                  <span>${project.categoryId?.name || 'Uncategorized'}</span>
                </div>
                <div class="flex items-center">
                  <FaCalendarAlt class="mr-1" />
                  <span>${creationDate}</span>
                </div>
                <div class="flex items-center">
                  <FaUser class="mr-1" />
                  <span>${project.userId?.name || 'Unknown'}</span>
                </div>
              </div>
              
              <div class="mt-3 pt-2 border-t border-gray-200">
                <a href="/admin/projects/${project._id}" class="inline-block px-3 py-1 bg-coquelicot-500 text-white text-xs rounded hover:bg-coquelicot-600 transition-colors">
                  View Details
                </a>
              </div>
            </div>
          `);

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(popup);
          
        // Only add marker to map if map is available
        if (map.current) {
          marker.addTo(map.current);
          // Store reference to marker for later cleanup
          markersRef.current.push(marker);
        }
          
        // Fly to the first project's location to center the map better
        if (filteredProjects.indexOf(project) === 0 && map.current) {
          // Use a small timeout to ensure the map is ready
          setTimeout(() => {
            if (map.current) {
              map.current.flyTo({
                center: [longitude, latitude],
                zoom: 13,
                essential: true
              });
            }
          }, 500);
        }
      }
    });
  }, [filteredProjects, loading, mapLoaded]);

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : ''}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>Project Locations</h1>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>View all projects on the map</p>
      </div>
      
      <div className={`mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm rounded-lg p-4 flex flex-wrap justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <FaLayerGroup className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
            <select
              className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-coquelicot-500 focus:border-coquelicot-500`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
          {loading ? (
            <span className="flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              Loading projects...
            </span>
          ) : (
            <span>
              {filteredProjects.length} of {projects.length} projects shown
            </span>
          )}
        </div>
      </div>
      
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg overflow-hidden relative`}>
        {/* Map container */}
        <div 
          ref={mapContainer} 
          className="w-full h-[calc(100vh-200px)] min-h-[500px]"
        />
        
        {/* Project list sidebar */}
        <div className={`absolute top-4 left-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-md w-64 max-h-[calc(100%-32px)] overflow-y-auto`}>
          <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>Project Locations</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="flex items-center text-xs">
                <span className="inline-block w-3 h-3 rounded-full mr-1 bg-blue-600"></span>
                <span>Demandé</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="inline-block w-3 h-3 rounded-full mr-1 bg-yellow-600"></span>
                <span>Accepteé</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="inline-block w-3 h-3 rounded-full mr-1 bg-coquelicot-500"></span>
                <span>En cours</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="inline-block w-3 h-3 rounded-full mr-1 bg-green-600"></span>
                <span>Terminé</span>
              </div>
            </div>
          </div>
          <div className="p-2">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <FaSpinner className="animate-spin text-coquelicot-500" />
              </div>
            ) : projects.filter(p => p.location && p.location.coordinates).length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} p-2`}>No projects with location data</p>
            ) : (
              <ul className="space-y-2">
                {filteredProjects
                  .filter(project => project.location && project.location.coordinates)
                  .map(project => (
                    <li 
                      key={project._id}
                      className={`p-2 rounded-md cursor-pointer transition-all duration-200 text-sm ${
                        selectedProject === project._id 
                          ? 'bg-coquelicot-500 text-white' 
                          : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedProject(project._id);
                        if (project.location && project.location.coordinates) {
                          const [lng, lat] = project.location.coordinates;
                          if (map.current) {
                            map.current.flyTo({
                            center: [lng, lat],
                            zoom: 15,
                            essential: true
                          });
                          }
                        }
                      }}
                    >
                      <div className="font-medium">{project.title}</div>
                      <div className={`text-xs ${selectedProject === project._id ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {project.status}
                      </div>
                    </li>
                  ))
                }
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
