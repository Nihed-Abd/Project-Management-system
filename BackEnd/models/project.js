const mongoose = require("mongoose");

// Define the location schema for storing geo coordinates
const LocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  pictures: { 
    type: [String], // Array of image URLs
    default: []
  },
  location: {
    type: LocationSchema,
    default: null
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Demandé", "Accepteé", "En cours", "terminé"], 
    default: "Demandé" 
  },
  creationDate: { 
    type: Date, 
    default: Date.now 
  },
  LastEditDate: { 
    type: Date, 
    default: Date.now 
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

// Update the LastEditDate whenever a project is updated
ProjectSchema.pre('findOneAndUpdate', function(next) {
  this.set({ LastEditDate: new Date() });
  next();
});

module.exports = mongoose.model("Project", ProjectSchema);



