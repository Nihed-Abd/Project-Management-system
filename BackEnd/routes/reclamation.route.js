// Reclamation Routes
// GET /             - Get all reclamations
// POST /            - Create a new reclamation
// GET /:id          - Get reclamation by ID
// PUT /:id          - Update reclamation by ID (admin response)
// DELETE /:id       - Delete reclamation by ID
// GET /user/:userId - Get reclamations by user ID
// GET /status/:status - Get reclamations by status

const express = require('express');
const router = express.Router();
const Reclamation = require('../models/reclamation');

// Get all reclamations
router.get('/', async (req, res) => {
    try {
        const reclamations = await Reclamation.find()
            .populate('userId', 'name email')
            .sort({ dateCreation: -1 });
        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new reclamation
router.post('/', async (req, res) => {
    const newReclamation = new Reclamation(req.body);
    try {
        await newReclamation.save();
        res.status(201).json(newReclamation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a reclamation by ID
router.get('/:id', async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id)
            .populate('userId', 'name email');
        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }
        res.status(200).json(reclamation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a reclamation (typically for admin response)
router.put('/:id', async (req, res) => {
    try {
        const updatedReclamation = await Reclamation.findById(req.params.id);
        
        if (!updatedReclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }
        
        // If admin is providing a response
        if (req.body.adminResponse) {
            updatedReclamation.adminResponse = req.body.adminResponse;
            updatedReclamation.statusRec = 'Answered';
            updatedReclamation.dateAnswer = new Date();
        }
        
        // Update other fields if needed
        if (req.body.object) updatedReclamation.object = req.body.object;
        if (req.body.message) updatedReclamation.message = req.body.message;
        if (req.body.statusRec) updatedReclamation.statusRec = req.body.statusRec;
        
        await updatedReclamation.save();
        
        res.status(200).json(updatedReclamation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a reclamation
router.delete('/:id', async (req, res) => {
    try {
        const deletedReclamation = await Reclamation.findByIdAndDelete(req.params.id);
        if (!deletedReclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }
        res.json({ message: "Reclamation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reclamations by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const reclamations = await Reclamation.find({ userId: req.params.userId })
            .sort({ dateCreation: -1 });
        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reclamations by status
router.get('/status/:status', async (req, res) => {
    try {
        const reclamations = await Reclamation.find({ statusRec: req.params.status })
            .populate('userId', 'name email')
            .sort({ dateCreation: -1 });
        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
