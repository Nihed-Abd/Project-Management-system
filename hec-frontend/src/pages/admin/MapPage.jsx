import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { FaSpinner, FaLayerGroup, FaUser, FaCalendarAlt } from 'react-icons/fa';

// Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZXlhbmEiLCJhIjoiY2tyaW90YjRyMG01bzJ2bXA0aHFrdXp0YyJ9.5nNCUKgRdGXdtakd-KUoeQ';

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
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
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
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [10.183333, 36.8], // Center on Tunis
      zoom: 8,
      pitch: 45, // Tilt the map for 3D effect
      bearing: 0,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Setup map for 3D buildings
    map.current.on('style.load', () => {
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
    if (!map.current || loading || projects.length === 0) return;
    
    // Ensure map is fully loaded before adding markers
    if (!map.current.loaded()) {
      map.current.on('load', () => addMarkersToMap());
      return;
    }
    
    addMarkersToMap();
    
    function addMarkersToMap() {

    // Remove existing markers if any
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].parentNode.removeChild(markers[0]);
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
        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map.current);
          
        // Fly to the first project's location to center the map better
        if (projects.indexOf(project) === 0) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 13,
            essential: true
          });
        }
      }
    });
  }, [filteredProjects, loading]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projects Location Map</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-coquelicot-500 focus:ring-coquelicot-500 text-sm"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
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
      </div>
      
      <div className="bg-gray-100 rounded-lg overflow-hidden relative">
        {/* Map container */}
        <div 
          ref={mapContainer} 
          className="w-full h-[calc(100vh-200px)] min-h-[500px]"
        />
        
        {/* Project list sidebar */}
        <div className="absolute top-4 left-4 bg-white rounded-md shadow-md w-64 max-h-[calc(100%-32px)] overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-700">Project Locations</h3>
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
              <p className="text-sm text-gray-500 p-2">No projects with location data</p>
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
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedProject(project._id);
                        if (project.location && project.location.coordinates) {
                          const [lng, lat] = project.location.coordinates;
                          map.current.flyTo({
                            center: [lng, lat],
                            zoom: 15,
                            essential: true
                          });
                        }
                      }}
                    >
                      <div className="font-medium">{project.title}</div>
                      <div className={`text-xs ${selectedProject === project._id ? 'text-white' : 'text-gray-500'}`}>
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
