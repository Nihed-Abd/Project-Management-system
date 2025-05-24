// Interview Routes
// GET /             - Get all interviews
// POST /            - Create a new interview
// GET /:id          - Get interview by ID
// PUT /:id          - Update interview by ID
// DELETE /:id       - Delete interview by ID
// GET /user/:userId - Get interviews by user ID
// GET /status/:status - Get interviews by status

const express = require('express');
const router = express.Router();
const Interview = require('../models/interview');

// Get all interviews
router.get('/', async (req, res) => {
    try {
        const interviews = await Interview.find()
            .populate('userId', 'name email picture')
            .sort({ date: 1 });
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new interview
router.post('/', async (req, res) => {
    const newInterview = new Interview(req.body);
    try {
        await newInterview.save();
        res.status(201).json(newInterview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get an interview by ID
router.get('/:id', async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('userId', 'name email picture');
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an interview
router.put('/:id', async (req, res) => {
    try {
        const updatedInterview = await Interview.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('userId', 'name email picture');
        
        if (!updatedInterview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        
        res.status(200).json(updatedInterview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an interview
router.delete('/:id', async (req, res) => {
    try {
        const deletedInterview = await Interview.findByIdAndDelete(req.params.id);
        if (!deletedInterview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.json({ message: "Interview deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get interviews by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.params.userId })
            .sort({ date: 1 });
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get interviews by status
router.get('/status/:status', async (req, res) => {
    try {
        const interviews = await Interview.find({ statusInterview: req.params.status })
            .populate('userId', 'name email picture')
            .sort({ date: 1 });
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
