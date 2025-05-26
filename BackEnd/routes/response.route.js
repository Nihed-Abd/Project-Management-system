const express = require('express');
const router = express.Router();
const Response = require('../models/response');
const Reclamation = require('../models/reclamation');

// Get all responses
router.get('/', async (req, res) => {
    try {
        const responses = await Response.find()
            .populate('reclamationId')
            .populate('adminId', 'name email picture');
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get responses by reclamation ID
router.get('/reclamation/:reclamationId', async (req, res) => {
    try {
        const responses = await Response.find({ reclamationId: req.params.reclamationId })
            .populate('adminId', 'name email picture')
            .sort({ dateCreated: -1 });
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new response
router.post('/', async (req, res) => {
    const response = new Response(req.body);
    
    try {
        // Save the response
        const savedResponse = await response.save();
        
        // Update the reclamation status to "Answered" and set dateAnswer
        await Reclamation.findByIdAndUpdate(
            req.body.reclamationId,
            { 
                statusRec: "Answered",
                dateAnswer: Date.now(),
                adminResponse: req.body.content
            }
        );
        
        res.status(201).json(savedResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a response by ID
router.get('/:id', async (req, res) => {
    try {
        const response = await Response.findById(req.params.id)
            .populate('reclamationId')
            .populate('adminId', 'name email picture');
        
        if (!response) {
            return res.status(404).json({ message: 'Response not found' });
        }
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a response
router.put('/:id', async (req, res) => {
    try {
        const updatedResponse = await Response.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!updatedResponse) {
            return res.status(404).json({ message: 'Response not found' });
        }
        
        res.status(200).json(updatedResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a response
router.delete('/:id', async (req, res) => {
    try {
        const deletedResponse = await Response.findByIdAndDelete(req.params.id);
        
        if (!deletedResponse) {
            return res.status(404).json({ message: 'Response not found' });
        }
        
        res.status(200).json({ message: 'Response deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
