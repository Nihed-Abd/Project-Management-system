const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const { verifyToken } = require('../middleware/auth');

// Get all projects with location data for the map (public access)
router.get('/projects-locations', async (req, res) => {
  try {
    // Find all projects with location data
    const projects = await Project.find({
      'location.coordinates': { $exists: true, $ne: null }
    })
    .populate('categoryId', 'name color')
    .populate('userId', 'name email')
    .select('title location description status creationDate pictures');

    res.json(projects);
  } catch (error) {
    console.error('Error fetching project locations:', error);
    res.status(500).json({ message: 'Server error while fetching project locations' });
  }
});

// Update project location
router.patch('/project-location/:id', verifyToken, async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update location with GeoJSON format
    project.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };

    await project.save();
    
    res.json({ message: 'Project location updated successfully', project });
  } catch (error) {
    console.error('Error updating project location:', error);
    res.status(500).json({ message: 'Server error while updating project location' });
  }
});

module.exports = router;
