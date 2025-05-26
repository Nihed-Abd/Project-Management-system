/**
 * This script helps populate random location data for projects that don't have coordinates
 * Run with: node scripts/populate-project-locations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/project');

// Define the boundaries of Tunisia for random coordinates
// These values are approximate and should be adjusted for more precise boundaries
const TUNISIA_BOUNDS = {
  north: 37.5, // Northern latitude
  south: 30.2, // Southern latitude
  west: 7.5,   // Western longitude
  east: 11.6   // Eastern longitude
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });

// Generate a random coordinate within Tunisia's boundaries
const generateRandomLocation = () => {
  const longitude = TUNISIA_BOUNDS.west + (Math.random() * (TUNISIA_BOUNDS.east - TUNISIA_BOUNDS.west));
  const latitude = TUNISIA_BOUNDS.south + (Math.random() * (TUNISIA_BOUNDS.north - TUNISIA_BOUNDS.south));
  
  return {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
};

// Main function to update projects without location data
const populateProjectLocations = async () => {
  try {
    // Find all projects without location data
    const projects = await Project.find({
      $or: [
        { location: { $exists: false } },
        { location: null }
      ]
    });

    if (projects.length === 0) {
      console.log('✅ All projects already have location data');
      return;
    }

    console.log(`Found ${projects.length} projects without location data`);
    
    // Update each project with random location
    for (const project of projects) {
      const randomLocation = generateRandomLocation();
      
      await Project.findByIdAndUpdate(
        project._id,
        { location: randomLocation },
        { new: true }
      );
      
      console.log(`Updated project: ${project.title}`);
    }
    
    console.log('✅ Successfully updated all projects with random location data');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

// Run the main function
populateProjectLocations();
